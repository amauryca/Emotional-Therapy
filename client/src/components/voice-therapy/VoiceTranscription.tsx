import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TherapyMessage } from '@/types';
import { Card } from '@/components/ui/card';
import TherapistAvatar from '@/components/shared/TherapistAvatar';
import { EMOTION_ICONS, VOCAL_TONE_ICONS } from '@/lib/constants';

interface VoiceTranscriptionProps {
  messages: TherapyMessage[];
}

export default function VoiceTranscription({ messages }: VoiceTranscriptionProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    }
  };
  
  return (
    <Card className="bg-white/95 backdrop-blur border-blue-100 p-3 h-[350px] md:h-[400px] overflow-y-auto shadow-sm relative">
      {/* Empty state message */}
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center text-sm text-gray-500 font-medium">
          Your conversation will appear here
        </div>
      )}
      
      {/* Chat messages */}
      <motion.div 
        className="space-y-4 min-h-full pb-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div 
              key={message.id} 
              variants={itemVariants}
              initial="hidden"
              animate="show"
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
            >
              <div 
                className={`
                  max-w-[90%] md:max-w-[85%] flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} 
                  w-auto items-start
                `}
              >
                {/* Therapist avatar for assistant messages */}
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1">
                    <TherapistAvatar 
                      emotion={message.mood?.emotion}
                      speaking={false}
                      style="professional"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  {/* Message bubble */}
                  <div 
                    className={`
                      rounded-lg px-3 py-2 text-sm break-words
                      ${message.role === 'user' 
                        ? 'bg-blue-500 text-white rounded-tr-none shadow-sm' 
                        : 'bg-blue-100 text-blue-900 rounded-tl-none shadow-sm'
                      }
                    `}
                  >
                    {message.content}
                  </div>
                  
                  {/* User message mood indicators (emotion and tone) */}
                  {message.role === 'user' && message.mood && (
                    <div className="flex flex-wrap justify-end gap-1 mt-1 text-xs text-gray-500">
                      {message.mood.emotion && (
                        <span className="flex items-center gap-0.5">
                          <span className="text-sm">{EMOTION_ICONS[message.mood.emotion]}</span>
                          <span className="capitalize">{message.mood.emotion}</span>
                        </span>
                      )}
                      
                      {message.mood.tone && (
                        <span className="flex items-center gap-0.5 ml-1">
                          <span className="opacity-50">•</span>
                          <span className="text-sm">{VOCAL_TONE_ICONS[message.mood.tone]}</span>
                          <span className="capitalize">{message.mood.tone}</span>
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div 
                    className={`
                      text-xs text-gray-400 mt-1
                      ${message.role === 'user' ? 'text-right' : 'text-left'}
                    `}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Empty div for auto-scrolling */}
        <div ref={messagesEndRef} className="h-4" />
      </motion.div>
      
      {/* Shadow gradient to indicate scrollable content */}
      {messages.length > 3 && (
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/90 to-transparent pointer-events-none"></div>
      )}
    </Card>
  );
}