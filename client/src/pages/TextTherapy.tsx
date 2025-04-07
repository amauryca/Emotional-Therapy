import { useState } from 'react';
import ChatInterface from '@/components/text-therapy/ChatInterface';
import InstructionsCard from '@/components/text-therapy/InstructionsCard';
import AgeGroupSelector from '@/components/shared/AgeGroupSelector';
import { usePuterAI } from '@/hooks/usePuterAI';
import { INITIAL_MESSAGES } from '@/lib/constants';
import { Emotion, SpeechToTextResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgeGroup } from '@/hooks/useLanguageComplexity';

export default function TextTherapy() {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral');
  
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
      
      const lowerText = message.toLowerCase();
      if (lowerText.includes('happy') || lowerText.includes('glad') || 
          lowerText.includes('good') || lowerText.includes('excited')) {
        detectedEmotion = 'happy';
      } else if (lowerText.includes('sad') || lowerText.includes('upset') || 
                lowerText.includes('depressed') || lowerText.includes('unhappy')) {
        detectedEmotion = 'sad';
      } else if (lowerText.includes('wow') || lowerText.includes('whoa') || 
                lowerText.includes('amazing') || lowerText.includes('shocked')) {
        detectedEmotion = 'surprised';
      } else if (lowerText.includes('angry') || lowerText.includes('mad') || 
                lowerText.includes('furious') || lowerText.includes('annoyed')) {
        detectedEmotion = 'angry';
      }
      
      // Update current emotion
      setCurrentEmotion(detectedEmotion);
      
      // Send message with speech-to-text result format and emotion
      const speechResult: SpeechToTextResult = {
        text: message,
        confidence: 1.0
      };
      
      sendMessage(speechResult, detectedEmotion);
    }
  };
  
  // No text-to-speech or avatar animations needed

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-beige-100 mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-beige-700">AI Text Therapist</CardTitle>
          
          {/* Age Group Selector */}
          <AgeGroupSelector
            currentAgeGroup={ageGroup}
            onAgeGroupChange={handleAgeGroupChange}
            className="w-40"
          />
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <p className="text-beige-600">
              Chat with the AI therapist by typing your thoughts and feelings below.
              The conversation adapts to your chosen age group and detected emotional tone.
            </p>
          </div>
          
          {/* Chat Interface - Full width now that avatar is removed */}
          <div className="w-full">
            <ChatInterface 
              messages={messages} 
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
            />
          </div>
          
          {/* Emotion context indicator */}
          {isProcessing && currentEmotion !== 'neutral' && (
            <div className="mt-3 text-sm text-beige-500 italic">
              The AI is analyzing your {currentEmotion} emotional tone to provide a more personalized response...
            </div>
          )}
        </CardContent>
      </Card>
      
      <InstructionsCard />
    </div>
  );
}
