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
    <Card className="bg-white border-blue-200 p-4 h-[250px] md:h-[300px] overflow-y-auto shadow-md relative">
      {/* Empty state message */}
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center text-sm text-blue-500 font-medium">
          <div className="text-center">
            <div className="text-2xl mb-1">💬</div>
            Your conversation will appear here
          </div>
        </div>
      )}
      
      {/* Chat messages */}
      <div className="space-y-4 min-h-full pb-2">
        {messages.map((message) => (
          <motion.div 
            key={message.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
          >
            <div 
              className={`
                max-w-[90%] md:max-w-[95%] flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} 
                w-auto items-start
              `}
            >
              {/* Therapist avatar for assistant messages */}
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 mt-1 hidden md:block">
                  <TherapistAvatar 
                    emotion={message.mood?.emotion}
                    speaking={false}
                    style="professional"
                  />
                </div>
              )}
              
              {/* User avatar for user messages */}
              {message.role === 'user' && (
                <div className="flex-shrink-0 h-6 w-6 md:h-7 md:w-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                  You
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                {/* Message bubble */}
                <div 
                  className={`
                    rounded-lg px-3 py-2 text-xs md:text-sm break-words
                    ${message.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-tr-none shadow-sm' 
                      : 'bg-blue-100 text-blue-900 rounded-tl-none shadow-sm'
                    }
                  `}
                >
                  {message.content}
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  {/* User message mood indicators (emotion and tone) - more compact */}
                  {message.role === 'user' && message.mood && (
                    <div className="flex flex-wrap justify-end gap-1 text-xs text-gray-500">
                      {message.mood.emotion && (
                        <span className="flex items-center gap-0.5 bg-blue-50 px-1 py-0.5 rounded-full text-xs">
                          <span>{EMOTION_ICONS[message.mood.emotion]}</span>
                          <span className="capitalize text-xs hidden md:inline">{message.mood.emotion}</span>
                        </span>
                      )}
                      
                      {message.mood.tone && (
                        <span className="flex items-center gap-0.5 bg-green-50 px-1 py-0.5 rounded-full text-xs ml-1">
                          <span>{VOCAL_TONE_ICONS[message.mood.tone]}</span>
                          <span className="capitalize text-xs hidden md:inline">{message.mood.tone}</span>
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Placeholder for assistant messages to keep alignment */}
                  {message.role === 'assistant' && <div></div>}
                  
                  {/* Timestamp */}
                  <div 
                    className={`
                      text-xs text-gray-400
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
            </div>
          </motion.div>
        ))}
        
        {/* Empty div for auto-scrolling */}
        <div ref={messagesEndRef} className="h-4" />
      </div>
      
      {/* Shadow gradient to indicate scrollable content */}
      {messages.length > 3 && (
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
      )}
    </Card>
  );
}