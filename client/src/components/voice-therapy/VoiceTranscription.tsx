import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TherapyMessage } from '@/types';
import { Card } from '@/components/ui/card';

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
  
  return (
    <Card className="bg-white border-gray-200 p-3 h-[250px] md:h-[300px] overflow-y-auto shadow-sm relative">
      {/* Empty state message */}
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center text-sm text-gray-500">
          <div className="text-center">
            Your conversation will appear here
          </div>
        </div>
      )}
      
      {/* Chat messages */}
      <div className="space-y-3 min-h-full">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
          >
            <div 
              className={`
                max-w-[90%] md:max-w-[95%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} 
                w-auto items-start
              `}
            >
              <div>
                {/* Message bubble */}
                <div 
                  className={`
                    rounded-lg px-3 py-2 text-xs md:text-sm break-words
                    ${message.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }
                  `}
                >
                  {message.content}
                </div>
                
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
          </div>
        ))}
        
        {/* Empty div for auto-scrolling */}
        <div ref={messagesEndRef} className="h-4" />
      </div>
      
      {/* Shadow gradient to indicate scrollable content */}
      {messages.length > 3 && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      )}
    </Card>
  );
}