import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendIcon, ChevronDown } from 'lucide-react';
import TherapyMessage from '@/components/shared/TherapyMessage';
import { TherapyMessage as TherapyMessageType } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInterfaceProps {
  messages: TherapyMessageType[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export default function ChatInterface({ 
  messages, 
  onSendMessage,
  isProcessing
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const conversationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput('');
      setAutoScroll(true); // Enable auto-scroll when user sends a message
    }
  };
  
  // Scroll to bottom when messages change if auto-scroll is enabled
  useEffect(() => {
    if (conversationRef.current && autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);
  
  // Monitor scroll position to show/hide scroll button
  useEffect(() => {
    const conversationContainer = conversationRef.current;
    if (!conversationContainer) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = conversationContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setAutoScroll(isNearBottom);
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };
    
    conversationContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      conversationContainer.removeEventListener('scroll', handleScroll);
    };
  }, [messages.length]);
  
  // Scroll to bottom function
  const scrollToBottom = () => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  };
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isMobile]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary/20 h-[calc(100vh-16rem)] md:h-96 flex flex-col relative animate-fadeIn">
      {/* Chat Messages */}
      <div 
        ref={conversationRef}
        className="flex-grow overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-3"
      >
        {messages.map((message) => (
          <TherapyMessage 
            key={message.id} 
            message={message} 
            isMobile={isMobile}
          />
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-secondary/20 rounded-lg py-2 px-3 max-w-[80%] animate-pulse">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button 
          onClick={() => {
            scrollToBottom();
            setAutoScroll(true);
          }}
          className="absolute bottom-16 right-4 bg-primary text-white p-2 rounded-full shadow-md opacity-80 hover:opacity-100 transition-opacity"
          aria-label="Scroll to latest messages"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
      
      {/* Chat Input */}
      <div className="border-t border-secondary/20 p-2 md:p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isMobile ? "Message..." : "Type your message here..."}
            disabled={isProcessing}
            className="border-secondary/30 text-sm md:text-base"
          />
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={!input.trim() || isProcessing}
            size={isMobile ? "sm" : "default"}
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
