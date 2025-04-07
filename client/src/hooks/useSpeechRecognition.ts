import { useState, useEffect, useCallback, useRef } from 'react';
import { SpeechRecognitionResult, SpeechToTextResult } from '@/types';
import { detectVocalTone, simulateVocalToneDetection } from '@/lib/ai';

interface UseSpeechRecognitionProps {
  onFinalTranscript?: (result: SpeechToTextResult, vocalTone?: string, toneConfidence?: number) => void;
  autoRestart?: boolean;
  pauseThreshold?: number; // in milliseconds, time to wait for pause before considering speech final
}

export function useSpeechRecognition({
  onFinalTranscript,
  autoRestart = true,
  pauseThreshold = 1500 // 1.5 seconds of silence for pause detection
}: UseSpeechRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const lastSpeechTimestampRef = useRef<number>(0);
  
  // Create and configure recognition instance
  const createRecognitionInstance = useCallback(() => {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const instance = new SpeechRecognition();
    
    // Configure recognition
    instance.continuous = true;
    instance.interimResults = true;
    instance.lang = 'en-US';
    
    // Set up event handlers
    instance.onstart = () => {
      setIsListening(true);
      setError(null);
      lastSpeechTimestampRef.current = Date.now();
    };
    
    instance.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      
      if (event.error === 'no-speech') {
        // No need to show error for no speech, just restart if needed
        if (autoRestart) {
          restartRecognition();
        }
      } else if (event.error === 'aborted') {
        // User manually stopped
        setIsListening(false);
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };
    
    instance.onend = () => {
      setIsListening(false);
      
      // Auto restart after a short delay if enabled
      if (autoRestart) {
        restartTimerRef.current = window.setTimeout(() => {
          try {
            instance.start();
          } catch (e) {
            console.error('Error restarting speech recognition:', e);
          }
        }, 300);
      }
    };
    
    instance.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      // Process final transcript
      if (finalTranscript !== '') {
        processFinalTranscript(finalTranscript, event.results[event.resultIndex][0].confidence);
      }
      
      // Update transcript state and timestamp
      if (interimTranscript || finalTranscript) {
        setTranscript(interimTranscript || finalTranscript);
        lastSpeechTimestampRef.current = Date.now();
        
        // Reset pause timer when speech is detected
        if (pauseTimerRef.current) {
          clearTimeout(pauseTimerRef.current);
          pauseTimerRef.current = null;
        }
        
        // Set timer to detect pauses in speech
        pauseTimerRef.current = window.setTimeout(() => {
          if (interimTranscript && Date.now() - lastSpeechTimestampRef.current >= pauseThreshold) {
            processFinalTranscript(interimTranscript, 0.8); // Assume decent confidence
            setTranscript('');
          }
        }, pauseThreshold);
      }
    };
    
    return instance;
  }, [autoRestart, pauseThreshold]);
  
  // Process final transcript and analyze vocal tone
  const processFinalTranscript = useCallback((text: string, confidence: number) => {
    if (!text.trim()) return;
    
    // Pre-process the text for better readability
    const processedText = text
      .trim()
      .replace(/(\s{2,})/g, ' ') // Remove extra spaces
      .replace(/^\s*i\s+/i, 'I ') // Capitalize 'i' at the beginning
      .replace(/(\.\s+|^)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase()); // Capitalize first letter after period
    
    // Analyze vocal tone from the text
    const vocalToneResult = detectVocalTone(processedText);
    
    if (onFinalTranscript) {
      onFinalTranscript(
        { text: processedText, confidence }, 
        vocalToneResult.tone,
        vocalToneResult.confidence
      );
    }
    
    // Clear the transcript after sending
    setTranscript('');
  }, [onFinalTranscript]);
  
  // Restart recognition with error handling
  const restartRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.abort();
    } catch (e) {
      console.error('Error aborting recognition:', e);
    }
    
    try {
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      }, 100);
    } catch (e) {
      console.error('Error restarting recognition:', e);
    }
  }, []);
  
  // Initialize speech recognition
  useEffect(() => {
    recognitionRef.current = createRecognitionInstance();
    
    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.error('Error aborting recognition on cleanup:', err);
        }
      }
      
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
    };
  }, [createRecognitionInstance]);
  
  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = createRecognitionInstance();
    }
    
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setError('Error starting speech recognition. Please try again.');
        
        // Try to recreate the instance
        recognitionRef.current = createRecognitionInstance();
        if (recognitionRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e) {
              console.error('Error on retry start:', e);
            }
          }, 200);
        }
      }
    }
  }, [createRecognitionInstance, isListening]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
    }
    
    // Clear any pending timers
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    
    setIsListening(false);
  }, []);
  
  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported: !!('webkitSpeechRecognition' in window) || !!('SpeechRecognition' in window)
  };
}
