import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CameraView } from '@/components/voice-therapy/CameraView';
import { EmotionPanel } from '@/components/voice-therapy/EmotionPanel';
import VoiceTranscription from '@/components/voice-therapy/VoiceTranscription';
import AmbientSoundPlayer from '@/components/voice-therapy/AmbientSoundPlayer';
import InstructionsCard from '@/components/voice-therapy/InstructionsCard';
import AgeGroupSelector from '@/components/shared/AgeGroupSelector';
import { SuccessNotification } from '@/components/ui/success-notification';
import { usePuterAI } from '@/hooks/usePuterAI';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { INITIAL_MESSAGES, EMOTION_ICONS, VOCAL_TONE_ICONS } from '@/lib/constants';
import { SpeechToTextResult, Emotion, VocalTone } from '@/types';
import { AgeGroup } from '@/hooks/useLanguageComplexity';
import { loadFaceModel, isModelLoaded } from '@/lib/faceApiLoader';
import { loadSpeechEmotionModel, isSpeechEmotionModelReady } from '@/lib/speechEmotionRecognition';
import { initializePuterJs, isPuterAIAvailable } from '@/lib/puterService';

export default function VoiceTherapy() {
  // State for emotion and vocal tone detection
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral');
  const [currentVocalTone, setCurrentVocalTone] = useState<VocalTone | undefined>(undefined);
  const [emotionConfidence, setEmotionConfidence] = useState(0.5);
  const [vocalToneConfidence, setVocalToneConfidence] = useState(0.5);
  
  // Model loading states
  const [modelStatus, setModelStatus] = useState({
    faceModel: false,
    speechModel: false,
    puterAI: false
  });
  
  // Voice recognition state
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  // Camera enabled state
  const [cameraEnabled, setCameraEnabled] = useState(true);
  
  // Success notification state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Speech recognition setup
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening,
    error: speechError
  } = useSpeechRecognition({
    onFinalTranscript: (result, vocalTone, toneConfidence) => {
      handleSpeech(result, vocalTone, toneConfidence);
    },
    autoRestart: true,
    pauseThreshold: 1500 // 1.5 seconds of silence to consider speech final
  });
  
  // Load models on component mount
  useEffect(() => {
    async function loadModels() {
      try {
        // Load Face-API.js for facial detection
        await loadFaceModel();
        setModelStatus(prev => ({ ...prev, faceModel: isModelLoaded() }));
        
        // Load speech emotion model
        await loadSpeechEmotionModel();
        setModelStatus(prev => ({ ...prev, speechModel: isSpeechEmotionModelReady() }));
        
        // Initialize Puter.js
        await initializePuterJs();
        setModelStatus(prev => ({ ...prev, puterAI: isPuterAIAvailable() }));
      } catch (error) {
        console.error('Error loading models:', error);
      }
    }
    
    loadModels();
  }, []);
  
  // Set up AI with Puter.js
  const { 
    messages, 
    sendMessage, 
    isProcessing,
    ageGroup,
    setAgeGroup
  } = usePuterAI({
    initialMessage: INITIAL_MESSAGES.voice,
    defaultAgeGroup: 'teenagers' // Start with teenager level
  });

  // Handle speech with enhanced emotion detection
  const handleSpeech = (speechResult: SpeechToTextResult, vocalTone?: string, toneConfidence = 0.5) => {
    if (speechResult.text.trim()) {
      // Update the current vocal tone with confidence
      if (vocalTone) {
        setCurrentVocalTone(vocalTone as VocalTone);
        setVocalToneConfidence(toneConfidence);
      }
      
      // Send message with both facial emotion and vocal tone context
      sendMessage(speechResult, currentEmotion, vocalTone as VocalTone);
      
      // Show success notification with confetti for positive interaction
      if (messages.length > 0 && 
          (currentEmotion === 'happy' || 
           currentEmotion === 'surprised' || 
           currentVocalTone === 'excited')) {
        setSuccessMessage('Great job expressing yourself!');
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      }
    }
  };

  // Handle facial emotion change with confidence score
  const handleEmotionChange = (emotion: string, confidence = 0.5) => {
    setCurrentEmotion(emotion as Emotion);
    setEmotionConfidence(confidence);
  };
  
  // Handle age group change
  const handleAgeGroupChange = (value: AgeGroup) => {
    setAgeGroup(value);
  };
  
  // Toggle voice recognition
  const toggleVoiceRecognition = useCallback(() => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    
    if (newState) {
      startListening();
    } else {
      stopListening();
    }
  }, [voiceEnabled, startListening, stopListening]);
  
  // Animation variants for elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto py-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Success notification with confetti */}
      <SuccessNotification 
        show={showSuccess}
        message={successMessage}
        duration={3000}
        withConfetti={true}
      />
      
      {/* Model Status Indicators */}
      <motion.div 
        className="flex justify-center mb-4 gap-2"
        variants={itemVariants}
      >
        <Badge 
          variant={modelStatus.faceModel ? "default" : "outline"} 
          className={`animate-pulse transition-all ${modelStatus.faceModel ? 'bg-green-500' : 'text-blue-500'}`}
        >
          Face Detection {modelStatus.faceModel ? 'Active' : 'Loading...'}
        </Badge>
        <Badge 
          variant={modelStatus.speechModel ? "default" : "outline"} 
          className={`animate-pulse transition-all ${modelStatus.speechModel ? 'bg-green-500' : 'text-blue-500'}`}
        >
          Speech AI {modelStatus.speechModel ? 'Active' : 'Loading...'}
        </Badge>
        <Badge 
          variant={modelStatus.puterAI ? "default" : "outline"} 
          className={`animate-pulse transition-all ${modelStatus.puterAI ? 'bg-green-500' : 'text-blue-500'}`}
        >
          Puter AI {modelStatus.puterAI ? 'Active' : 'Loading...'}
        </Badge>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="bg-white border-gray-200 shadow-sm mb-6 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-gray-800">Voice Chat</CardTitle>
            </div>
            
            {/* Age Group Selector */}
            <AgeGroupSelector
              currentAgeGroup={ageGroup}
              onAgeGroupChange={handleAgeGroupChange}
              className="w-40"
            />
          </CardHeader>
          
          <CardContent>
            <div className="mb-4">
              <p className="text-gray-600 text-sm">
                This chat uses your camera and microphone for communication.
              </p>
            </div>
            
            {/* Controls bar */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={toggleVoiceRecognition}
                  variant={voiceEnabled ? "default" : "outline"}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  {voiceEnabled ? '🎙️ Voice Active' : '🎙️ Enable Voice'}
                </Button>
                
                <Button 
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  variant={cameraEnabled ? "default" : "outline"}
                  size="sm"
                >
                  {cameraEnabled ? 'Camera On' : 'Camera Off'}
                </Button>
              </div>
              
              {/* Ambient Sound Player */}
              <AmbientSoundPlayer />
            </div>
            
            {/* Side-by-side layout for medium screens and above */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Left side - Camera and emotion */}
              <div className="w-full md:w-1/2 flex flex-col gap-3">
                {/* Camera View */}
                <CameraView 
                  isEnabled={cameraEnabled}
                  onEmotionDetected={(result) => {
                    handleEmotionChange(result.emotion, result.confidence);
                  }} 
                  className="w-full h-[250px] md:h-[300px]"
                />
                
                {/* Emotion Panel */}
                <EmotionPanel 
                  currentEmotion={currentEmotion} 
                  confidenceLevel={emotionConfidence}
                  compact={true}
                />
              </div>
              
              {/* Right side - Chat */}
              <div className="w-full md:w-1/2">
                <VoiceTranscription messages={messages} />
              </div>
            </div>
            
            {/* Processing indicator with animation */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div 
                  className="mt-3 text-sm text-gray-500 italic bg-gray-50 p-2 rounded-md border border-gray-200"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="inline-block mr-2 animate-spin">⏳</span>
                  Processing your message...
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants} transition={{ delay: 0.8 }}>
        <InstructionsCard />
      </motion.div>
    </motion.div>
  );
}
