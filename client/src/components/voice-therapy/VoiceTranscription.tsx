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
    <Card className="bg-white/90 backdrop-blur border-blue-100 p-3 h-[400px] overflow-y-auto shadow-sm">
      <motion.div 
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {messages.map((message, index) => (
          <motion.div 
            key={message.id} 
            variants={itemVariants}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[85%] flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}
              `}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 mt-1">
                  <TherapistAvatar 
                    emotion={message.mood?.emotion}
                    speaking={false}
                    style="professional"
                  />
                </div>
              )}
              
              <div>
                <div 
                  className={`
                    rounded-lg px-3 py-2 text-sm transition-all duration-300
                    ${message.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-tr-none animate-slideInLeft' 
                      : 'bg-blue-100 text-blue-900 rounded-tl-none animate-slideInRight'
                    }
                  `}
                >
                  {message.content}
                </div>
                
                {/* Show emotion and vocal tone indicators for user messages */}
                {message.role === 'user' && message.mood && (
                  <div className="flex justify-end gap-1 mt-1 text-xs text-gray-500">
                    {message.mood.emotion && (
                      <span className="flex items-center gap-0.5">
                        <span className="text-sm">{EMOTION_ICONS[message.mood.emotion]}</span>
                        <span className="capitalize">{message.mood.emotion}</span>
                      </span>
                    )}
                    
                    {message.mood.tone && (
                      <span className="flex items-center gap-0.5">
                        <span>•</span>
                        <span className="text-sm">{VOCAL_TONE_ICONS[message.mood.tone]}</span>
                        <span className="capitalize">{message.mood.tone}</span>
                      </span>
                    )}
                  </div>
                )}
                
                {/* Timestamp for both message types */}
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
              
              {message.role === 'user' && (
                <div className="flex items-start mt-1">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                    👤
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {/* Auto-scroll reference div */}
        <div ref={messagesEndRef} />
      </motion.div>
      
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center text-blue-400 italic text-sm">
          No messages yet. Start speaking to begin the conversation.
        </div>
      )}
    </Card>
  );
}