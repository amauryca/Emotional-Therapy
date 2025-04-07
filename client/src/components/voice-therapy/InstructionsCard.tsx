import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, Mic, Camera, Brain, ShieldCheck, BookOpen } from 'lucide-react';
import { PRIVACY_NOTE } from '@/lib/constants';

export default function InstructionsCard() {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="bg-blue-50 border-blue-100 overflow-hidden transition-all duration-300 relative mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-green-50/20 animate-shimmer"></div>
      
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 cursor-pointer relative z-10" onClick={toggleExpanded}>
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ x: 2 }}
        >
          <BookOpen className="h-5 w-5 text-blue-600 animate-pulse" />
          <CardTitle className="text-blue-700 text-base font-medium">Voice Therapy Instructions</CardTitle>
        </motion.div>
        
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5 text-blue-600" />
        </motion.div>
      </CardHeader>
      
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <CardContent className="relative z-10">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 p-1.5 rounded-full">
                    <Mic className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-700 mb-1">How to Use Voice Therapy</h3>
                    <p className="text-blue-600 text-sm">
                      Speak naturally into your microphone when ready. The AI therapist will listen to your words and analyze your vocal tone 
                      to provide personalized responses. Try to speak clearly and at a normal pace for the best results.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 p-1.5 rounded-full">
                    <Camera className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-700 mb-1">Facial Emotion Recognition</h3>
                    <p className="text-blue-600 text-sm">
                      The camera will detect facial expressions to better understand your emotional state.
                      Position yourself so your face is clearly visible and well-lit for optimal emotion recognition.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 p-1.5 rounded-full">
                    <Brain className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-700 mb-1">AI Personalization</h3>
                    <p className="text-green-600 text-sm">
                      The AI adapts responses based on your detected emotions, vocal tone, and age group setting.
                      For more personalized interaction, try setting the appropriate age group from the dropdown menu above.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 p-1.5 rounded-full">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-700 mb-1">Privacy</h3>
                    <p className="text-green-600 text-sm">
                      {PRIVACY_NOTE}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-100 transition-all"
                    onClick={toggleExpanded}
                  >
                    Close Instructions
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}