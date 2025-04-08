import { useState, useCallback, useRef } from 'react';
import { TherapyMessage, SpeechToTextResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { processTextComplexity } from '@/lib/ai';
import { LANGUAGE_COMPLEXITY_LEVELS } from '@/lib/constants';
import { useLanguageComplexity, AgeGroup } from '@/hooks/useLanguageComplexity';

interface UsePuterAIProps {
  initialMessage?: string;
  defaultAgeGroup?: AgeGroup;
}

export function usePuterAI({
  initialMessage,
  defaultAgeGroup = 'adults'
}: UsePuterAIProps = {}) {
  const [messages, setMessages] = useState<TherapyMessage[]>(() => {
    // Initialize with the welcome message if provided
    if (initialMessage) {
      return [
        {
          id: uuidv4(),
          content: initialMessage,
          role: 'assistant',
          timestamp: new Date()
        }
      ];
    }
    return [];
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the language complexity hook
  const { 
    ageGroup, 
    setAgeGroup, 
    getComplexityLevel,
    getTherapeuticPrompt 
  } = useLanguageComplexity({ defaultAgeGroup });
  
  // For backward compatibility
  const [languageComplexity, setLanguageComplexity] = useState(
    defaultAgeGroup === 'children' ? 0 : 
    defaultAgeGroup === 'teenagers' ? 1 : 2
  );
  
  // Keep track of conversation context
  const conversationContextRef = useRef<{
    userMood: {
      facialEmotion?: string;
      vocalTone?: string;
      textSentiment?: string;
    };
    recentTopics: string[];
    messageCount: number;
  }>({
    userMood: {},
    recentTopics: [],
    messageCount: initialMessage ? 1 : 0
  });

  // Function to send a message and get AI response
  const sendMessage = useCallback(async (
    content: string | SpeechToTextResult, 
    facialEmotion?: string,
    vocalTone?: string
  ) => {
    // Extract content text either from string or SpeechToTextResult
    const messageText = typeof content === 'string' ? content : content.text;
    
    if (!messageText.trim()) return;
    
    // Update mood context
    if (facialEmotion) {
      conversationContextRef.current.userMood.facialEmotion = facialEmotion;
    }
    
    if (vocalTone) {
      conversationContextRef.current.userMood.vocalTone = vocalTone;
    }
    
    // Process the message for better display - ensure first word is capitalized
    const processedMessage = messageText.trim()
      .replace(/^([a-z])/, match => match.toUpperCase())
      .replace(/\s{2,}/g, ' '); // Remove multiple spaces
    
    // Add user message to chat
    const userMessage: TherapyMessage = {
      id: uuidv4(),
      content: processedMessage,
      role: 'user',
      timestamp: new Date(),
      mood: {
        emotion: facialEmotion as any,
        tone: vocalTone as any
      }
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setError(null);
    
    try {
      // Check if window.puter exists - if not, try to initialize it on-demand
      if (!window.puter || !window.puter.ai || !window.puter.ai.chat) {
        console.log('Puter AI not detected, attempting to initialize...');
        // Import and call the initializePuterJs function
        const { initializePuterJs } = await import('@/lib/puterService');
        await initializePuterJs();
        
        // Verify again
        if (!window.puter || !window.puter.ai || !window.puter.ai.chat) {
          throw new Error('Puter AI is not available despite initialization attempt');
        }
      }
      
      // Update recent topics with keywords from user message
      const keywords = extractKeywords(messageText);
      conversationContextRef.current.recentTopics = [
        ...keywords,
        ...conversationContextRef.current.recentTopics
      ].slice(0, 10); // Keep only the 10 most recent topics
      
      // Increment message count
      conversationContextRef.current.messageCount++;
      
      // Get context from recent topics if this isn't the first message
      let conversationContext = '';
      if (conversationContextRef.current.messageCount > 1 && 
          conversationContextRef.current.recentTopics.length > 0) {
        conversationContext = `This is part of an ongoing conversation about ${
          conversationContextRef.current.recentTopics.slice(0, 3).join(', ')
        }.`;
      }
      
      // Use the therapeutic prompt generator from our language complexity hook
      const prompt = getTherapeuticPrompt(
        messageText,
        facialEmotion,
        vocalTone
      );
      
      // Add conversation context if available
      const finalPrompt = conversationContext ? 
        `${conversationContext}\n\n${prompt}` : 
        prompt;
      
      // Set up timeout for API call
      const timeoutPromise = new Promise<{message: {content: string, role: string}}>((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('AI response timed out'));
        }, 10000); // 10 second timeout
      });
      
      // Call puter.ai.chat with the final prompt with timeout protection
      const response = await Promise.race([
        window.puter.ai.chat(finalPrompt),
        timeoutPromise
      ]);
      
      // Check if we got a valid response
      if (!response || !response.message || !response.message.content) {
        throw new Error('Invalid response from AI');
      }
      
      // Get the complexity level from the hook
      const currentComplexityLevel = getComplexityLevel();
      
      // Process the response text based on language complexity
      const processedContent = processTextComplexity(
        response.message.content,
        currentComplexityLevel
      );
      
      // Add AI response to chat
      const aiMessage: TherapyMessage = {
        id: uuidv4(),
        content: processedContent,
        role: 'assistant',
        timestamp: new Date(),
        // Respond to the user's emotion for better responsiveness
        mood: {
          emotion: facialEmotion ? 
            (facialEmotion === 'happy' ? 'happy' : 
             facialEmotion === 'sad' ? 'neutral' : 
             facialEmotion === 'angry' ? 'calm' : 'neutral') as any : undefined
        }
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      console.error('Error processing AI response:', err);
      
      // Provide a more helpful error message based on the type of error
      let errorContent = 'I encountered an issue processing your request. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('timeout') || err.message.includes('timed out')) {
          errorContent = "I'm thinking a bit longer than usual. Let's try again with a simpler response.";
        } else if (err.message.includes('not available')) {
          errorContent = "I'm having trouble connecting right now. I'm still here to listen though. Could you try sharing again?";
        }
      }
      
      setError(errorContent);
      
      // Add friendly error message to chat
      const errorMessage: TherapyMessage = {
        id: uuidv4(),
        content: errorContent,
        role: 'assistant',
        timestamp: new Date(),
        mood: {
          emotion: 'neutral' as any
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [getTherapeuticPrompt, getComplexityLevel]);
  
  // Helper function to extract keywords from text
  const extractKeywords = (text: string): string[] => {
    const stopWords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 
      'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 
      'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 
      'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 
      'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 
      'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 
      'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 
      'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 
      'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 
      'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 
      'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 
      'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 
      'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 
      'wasn', 'weren', 'won', 'wouldn'];
    
    // Tokenize and filter
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word => word.length > 3 && !stopWords.includes(word)) // Filter out short words and stopwords
      .slice(0, 5); // Take top 5 keywords
  };
  
  // Change language complexity level
  const setComplexity = useCallback((level: number) => {
    if (level >= 0 && level <= 2) {
      setLanguageComplexity(level);
      
      // Also update the age group in our language complexity hook
      if (level === 0) {
        setAgeGroup('children');
      } else if (level === 1) {
        setAgeGroup('teenagers');
      } else {
        setAgeGroup('adults');
      }
    }
  }, [setAgeGroup]);

  return {
    messages,
    sendMessage,
    isProcessing,
    error,
    // Original complexity props for backward compatibility
    languageComplexity,
    setComplexity,
    // New age group props
    ageGroup,
    setAgeGroup
  };
}
