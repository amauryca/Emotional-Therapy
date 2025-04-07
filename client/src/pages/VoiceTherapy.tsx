import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CameraView } from '@/components/voice-therapy/CameraView';
import { EmotionPanel } from '@/components/voice-therapy/EmotionPanel';
import { EmotionVisualizer } from '@/components/voice-therapy/EmotionVisualizer';
import VoiceTranscription from '@/components/voice-therapy/VoiceTranscription';
import InstructionsCard from '@/components/voice-therapy/InstructionsCard';
import AgeGroupSelector from '@/components/shared/AgeGroupSelector';
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
  
  // Get icon for current emotion and vocal tone
  const getEmotionIcon = () => EMOTION_ICONS[currentEmotion] || '😐';
  const getVocalToneIcon = () => currentVocalTone ? (VOCAL_TONE_ICONS[currentVocalTone] || '🗣️') : '🗣️';

  return (
    <motion.div 
      className="max-w-4xl mx-auto py-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
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
        <Card className="bg-blue-50 border-blue-100 shadow-md mb-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-green-100/20 animate-shimmer"></div>
          
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <motion.div 
                className="text-blue-600 text-2xl animate-float"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                🎙️
              </motion.div>
              <CardTitle className="text-blue-700">AI Voice Therapist</CardTitle>
            </motion.div>
            
            {/* Age Group Selector with animation */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <AgeGroupSelector
                currentAgeGroup={ageGroup}
                onAgeGroupChange={handleAgeGroupChange}
                className="w-40"
              />
            </motion.div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <motion.div 
              className="mb-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-blue-700">
                This therapy session uses your camera and microphone for a personalized experience.
                The AI adapts responses based on your facial expressions and vocal tone detected from the indicators below.
              </p>
            </motion.div>
            
            {/* Emotion and Vocal Tone Indicators */}
            <motion.div 
              className="flex flex-wrap gap-3 mb-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div 
                className="flex items-center gap-1.5 bg-blue-100 rounded-full px-3 py-1.5"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-blue-800 font-medium">Facial Emotion:</span>
                <span className="flex items-center gap-1">
                  <motion.span 
                    className="text-lg animate-pulse"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {getEmotionIcon()}
                  </motion.span>
                  <span className="capitalize text-blue-900">{currentEmotion}</span>
                  <span className="text-xs text-blue-500">({Math.round(emotionConfidence * 100)}%)</span>
                </span>
              </motion.div>
              
              {currentVocalTone && (
                <motion.div 
                  className="flex items-center gap-1.5 bg-green-100 rounded-full px-3 py-1.5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-green-800 font-medium">Vocal Tone:</span>
                  <span className="flex items-center gap-1">
                    <motion.span 
                      className="text-lg animate-pulse"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {getVocalToneIcon()}
                    </motion.span>
                    <span className="capitalize text-green-900">{currentVocalTone}</span>
                    <span className="text-xs text-green-500">({Math.round(vocalToneConfidence * 100)}%)</span>
                  </span>
                </motion.div>
              )}
            </motion.div>
            
            <motion.div 
              className="flex flex-col md:flex-row gap-6 md:gap-8 max-w-full"
              variants={itemVariants}
            >
              <div className="md:w-1/2 flex flex-col gap-4">
                {/* Emotion detection with camera */}
                <CameraView 
                  isEnabled={cameraEnabled}
                  onEmotionDetected={(result) => {
                    handleEmotionChange(result.emotion, result.confidence);
                  }} 
                  className="w-full"
                />
                
                {/* Emotion stats panel */}
                <EmotionPanel 
                  currentEmotion={currentEmotion} 
                  confidenceLevel={emotionConfidence}
                  compact={true}
                />
              </div>
              
              <motion.div 
                className="md:w-1/2 w-full flex-shrink-0 flex-grow md:min-w-[320px] flex flex-col gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {/* Voice controls */}
                <div className="flex items-center justify-between mb-2">
                  <Button 
                    onClick={toggleVoiceRecognition}
                    variant={voiceEnabled ? "default" : "outline"}
                    className="flex items-center gap-2"
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
                
                {/* Chat Transcription */}
                <VoiceTranscription messages={messages} />
              </motion.div>
            </motion.div>
            
            {/* Processing indicator with animation */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div 
                  className="mt-3 text-sm text-blue-500 italic bg-blue-50 p-2 rounded-md border border-blue-100"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="inline-block mr-2 animate-spin">⏳</span>
                  The AI is analyzing your <span className="font-medium text-blue-700">{currentEmotion}</span> facial expression 
                  {currentVocalTone && <> and <span className="font-medium text-green-700">{currentVocalTone}</span> vocal tone</>} 
                  to provide a more personalized response...
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
