import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from '@/components/text-therapy/ChatInterface';
import InstructionsCard from '@/components/text-therapy/InstructionsCard';
import AgeGroupSelector from '@/components/shared/AgeGroupSelector';
import { usePuterAI } from '@/hooks/usePuterAI';
import { INITIAL_MESSAGES, EMOTION_ICONS } from '@/lib/constants';
import { Emotion, SpeechToTextResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgeGroup } from '@/hooks/useLanguageComplexity';
import { Badge } from "@/components/ui/badge";
import { AmbientPlayer } from '@/components/audio/AmbientPlayer';
import { getThemeClasses, textTherapyTheme } from '@/lib/theme';

export default function TextTherapy() {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral');
  const [emotionConfidence, setEmotionConfidence] = useState(0.5);
  
  const { 
    messages, 
    sendMessage, 
    isProcessing,
    ageGroup,
    setAgeGroup
  } = usePuterAI({
    initialMessage: INITIAL_MESSAGES.text,
    defaultAgeGroup: 'teenagers' // Default to teenager level
  });
  
  // Handle age group change
  const handleAgeGroupChange = (value: AgeGroup) => {
    setAgeGroup(value);
  };
  
  // Handle message input with emotion detection
  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      // Simple sentiment analysis to detect emotion
      let detectedEmotion: Emotion = 'neutral';
      let confidence = 0.5;
      
      const lowerText = message.toLowerCase();
      if (lowerText.includes('happy') || lowerText.includes('glad') || 
          lowerText.includes('good') || lowerText.includes('excited')) {
        detectedEmotion = 'happy';
        confidence = 0.85;
      } else if (lowerText.includes('sad') || lowerText.includes('upset') || 
                lowerText.includes('depressed') || lowerText.includes('unhappy')) {
        detectedEmotion = 'sad';
        confidence = 0.85;
      } else if (lowerText.includes('wow') || lowerText.includes('whoa') || 
                lowerText.includes('amazing') || lowerText.includes('shocked')) {
        detectedEmotion = 'surprised';
        confidence = 0.80;
      } else if (lowerText.includes('angry') || lowerText.includes('mad') || 
                lowerText.includes('furious') || lowerText.includes('annoyed')) {
        detectedEmotion = 'angry';
        confidence = 0.85;
      } else if (lowerText.includes('fear') || lowerText.includes('scared') || 
                lowerText.includes('afraid') || lowerText.includes('worry')) {
        detectedEmotion = 'fearful';
        confidence = 0.82;
      } else if (lowerText.includes('disgust') || lowerText.includes('gross') || 
                lowerText.includes('revolting')) {
        detectedEmotion = 'disgusted';
        confidence = 0.80;
      }
      
      // Update current emotion
      setCurrentEmotion(detectedEmotion);
      setEmotionConfidence(confidence);
      
      // Send message with speech-to-text result format and emotion
      const speechResult: SpeechToTextResult = {
        text: message,
        confidence: 1.0
      };
      
      sendMessage(speechResult, detectedEmotion);
    }
  };
  
  // Animation variants
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
  
  // Get icon for current emotion
  const getEmotionIcon = () => EMOTION_ICONS[currentEmotion] || '😐';
  
  // Get theme classes for consistent styling
  const theme = getThemeClasses(textTherapyTheme);

  return (
    <motion.div 
      className="max-w-4xl mx-auto py-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Card className={`shadow-md mb-6 overflow-hidden relative ${theme.cardBg} ${theme.cardBorder}`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} animate-shimmer`}></div>
          
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <motion.div 
                className={`text-2xl animate-float ${theme.textPrimary}`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                💬
              </motion.div>
              <div className="flex flex-col">
                <CardTitle className={theme.textPrimary}>AI Text Therapist</CardTitle>
                <Badge variant="secondary" className={`mt-1 ${theme.badgePrimary}`}>
                  <span className="mr-1">{getEmotionIcon()}</span>
                  {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
                </Badge>
              </div>
            </motion.div>
            
            {/* Age Group Selector with animation */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="flex items-center gap-3"
            >
              {/* Ambient Sound Player */}
              <div className="flex items-center">
                <AmbientPlayer isCompact={true} />
              </div>
              
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
              <p className={theme.textPrimary}>
                Chat with the AI therapist by typing your thoughts and feelings below.
                The conversation adapts to your chosen age group and detects emotional tones from your messages.
              </p>
            </motion.div>
            
            {/* Emotion Indicator */}
            <motion.div 
              className="flex flex-wrap gap-3 mb-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div 
                className={`flex items-center gap-1.5 ${theme.badgePrimary} rounded-full px-3 py-1.5`}
                whileHover={{ scale: 1.05 }}
              >
                <span className={`${theme.textPrimary} font-medium`}>Detected Emotion:</span>
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
                  <span className={`capitalize ${theme.textPrimary}`}>{currentEmotion}</span>
                  <span className={`text-xs ${theme.textSecondary}`}>({Math.round(emotionConfidence * 100)}%)</span>
                </span>
              </motion.div>
            </motion.div>
            
            {/* Chat Interface with improved styling */}
            <motion.div
              variants={itemVariants}
              className="w-full"
            >
              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
              />
            </motion.div>
            
            {/* Processing indicator with animation */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div 
                  className={`mt-3 text-sm ${theme.textSecondary} italic ${theme.cardBg} p-2 rounded-md ${theme.cardBorder}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="inline-block mr-2 animate-spin">⏳</span>
                  The AI is analyzing your <span className={`font-medium ${theme.textPrimary} capitalize`}>{currentEmotion}</span> emotional tone 
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
