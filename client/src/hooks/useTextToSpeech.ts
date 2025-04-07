import { useState, useEffect, useRef } from 'react';

interface UseTextToSpeechProps {
  autoSpeak?: boolean;
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useTextToSpeech({
  autoSpeak = false,
  voice = null,
  rate = 1,
  pitch = 1,
  volume = 1
}: UseTextToSpeechProps = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track the current utterance
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Initialize speech synthesis
  useEffect(() => {
    // Check browser support
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setError('Speech synthesis is not supported in your browser');
      setIsSupported(false);
      return;
    }
    
    setIsSupported(true);
    
    // Load available voices
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setAvailableVoices(allVoices);
    };
    
    // Get initial voices
    loadVoices();
    
    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Clean up on unmount
    return () => {
      cancelSpeech();
    };
  }, []);
  
  // Speak text function
  const speak = (text: string) => {
    if (!isSupported || !text) {
      return;
    }
    
    try {
      // Cancel any ongoing speech
      cancelSpeech();
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice if specified, otherwise use default
      if (voice) {
        utterance.voice = voice;
      } else if (availableVoices.length > 0) {
        // Try to find a female voice for a therapist-like experience
        const femaleVoice = availableVoices.find(v => 
          v.name.includes('female') || 
          v.name.includes('Samantha') ||
          v.name.includes('Victoria') ||
          v.name.includes('Karen')
        );
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
      }
      
      // Set speech parameters
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      
      // Set event handlers
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        setError(`Speech synthesis error: ${event.error}`);
        setIsSpeaking(false);
      };
      
      // Save reference to current utterance
      utteranceRef.current = utterance;
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
      
    } catch (err) {
      setError(`Error initializing speech: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Pause speech
  const pauseSpeech = () => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  
  // Resume speech
  const resumeSpeech = () => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };
  
  // Cancel speech
  const cancelSpeech = () => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };
  
  return {
    speak,
    pauseSpeech,
    resumeSpeech,
    cancelSpeech,
    isSpeaking,
    isPaused,
    availableVoices,
    isSupported,
    error
  };
}