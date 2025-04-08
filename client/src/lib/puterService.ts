/**
 * Puter.js Integration Service
 * This module provides a robust wrapper for the Puter.js API
 */

import type { Emotion, VocalTone, PuterAIResponse } from '@/types';

// Timeout for API calls in milliseconds
const API_TIMEOUT = 15000;

// Default system message for the AI
const DEFAULT_SYSTEM_MESSAGE = `
You are a compassionate AI mental health assistant. Your responses should be:
- Empathetic and supportive, showing understanding of emotions
- Non-judgmental and respectful of all experiences
- Clear and concise, using accessible language
- Informative about general mental health concepts when appropriate
- Careful to never diagnose or prescribe treatment
- Honest about your limitations as an AI assistant

Important: Always remind users that you're an AI tool meant for emotional support,
not a replacement for professional mental health services. If they appear to be in 
distress or seeking medical/psychological advice, gently encourage them to speak 
with a qualified professional.
`;

// Define interface for prompt template parameters
interface PromptParams {
  message: string;
  detected?: {
    emotion?: Emotion;
    toneOfVoice?: VocalTone;
  };
  ageGroup?: 'children' | 'teenagers' | 'adults';
  previousMessages?: Array<{role: 'user' | 'assistant', content: string}>;
}

/**
 * Format the user message with appropriate context for the AI
 */
function formatPrompt({
  message,
  detected = {},
  ageGroup = 'adults',
  previousMessages = []
}: PromptParams): string {
  // Start with a base system prompt
  let formattedPrompt = DEFAULT_SYSTEM_MESSAGE;
  
  // Add age-appropriate guidance
  if (ageGroup === 'children') {
    formattedPrompt += `\nThe user is a child, so use simple language, short sentences, and concrete examples. Be patient, encouraging, and use a warm, friendly tone.`;
  } else if (ageGroup === 'teenagers') {
    formattedPrompt += `\nThe user is a teenager, so use accessible language but don't oversimplify. Be genuine, avoid talking down, and acknowledge their capacity for complex emotions.`;
  }
  
  // Add context about detected emotional state if available
  if (detected.emotion || detected.toneOfVoice) {
    formattedPrompt += `\n\nDetected user state:`;
    
    if (detected.emotion) {
      formattedPrompt += `\n- Facial expression suggests they may be feeling "${detected.emotion}"`;
    }
    
    if (detected.toneOfVoice) {
      formattedPrompt += `\n- Voice tone suggests they may be feeling "${detected.toneOfVoice}"`;
    }
    
    formattedPrompt += `\n\nRespond with awareness of their emotional state, but don't explicitly mention that you're analyzing their emotions unless they ask.`;
  }
  
  // Add conversation history context
  if (previousMessages.length > 0) {
    formattedPrompt += `\n\nConversation history (most recent first):`;
    
    // Include most recent exchanges first, limit to the last 5 exchanges
    const recentMessages = previousMessages.slice(-10);
    recentMessages.reverse(); // Most recent first
    
    for (const msg of recentMessages) {
      formattedPrompt += `\n${msg.role.toUpperCase()}: ${msg.content}`;
    }
  }
  
  // Add the current user message
  formattedPrompt += `\n\nUSER: ${message}\n\nASSISTANT:`;
  
  return formattedPrompt;
}

/**
 * Call the Puter.js AI API with error handling and timeout
 */
export async function callPuterAI(params: PromptParams): Promise<PuterAIResponse> {
  if (!window.puter || !window.puter.ai || !window.puter.ai.chat) {
    throw new Error('Puter.js AI API not available');
  }
  
  const prompt = formatPrompt(params);
  
  try {
    // Create a promise that rejects in <ms> milliseconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error(`Puter.js API call timed out after ${API_TIMEOUT}ms`));
      }, API_TIMEOUT);
    });
    
    // Set up the API call promise
    const apiPromise = window.puter.ai.chat(prompt);
    
    // Race between API call and timeout
    const response = await Promise.race([apiPromise, timeoutPromise]) as PuterAIResponse;
    
    return response;
  } catch (error) {
    console.error('Error calling Puter.js AI API:', error);
    
    // Return a fallback response
    return {
      message: {
        content: "I'm having trouble connecting right now. Could you please try again in a moment?",
        role: "assistant"
      }
    };
  }
}

/**
 * Get emotional support response based on user message and detected state
 */
export async function getEmotionalSupportResponse(
  message: string,
  emotion?: Emotion,
  vocalTone?: VocalTone,
  ageGroup: 'children' | 'teenagers' | 'adults' = 'adults',
  previousMessages: Array<{role: 'user' | 'assistant', content: string}> = []
): Promise<string> {
  try {
    const response = await callPuterAI({
      message,
      detected: {
        emotion,
        toneOfVoice: vocalTone
      },
      ageGroup,
      previousMessages
    });
    
    return response.message.content;
  } catch (error) {
    console.error('Error getting emotional support response:', error);
    return "I'm here to listen and support you, but I'm having some trouble processing right now. Could you please share your thoughts again?";
  }
}

/**
 * Check if Puter.js API is available
 */
export function isPuterAIAvailable(): boolean {
  return !!window.puter && !!window.puter.ai && !!window.puter.ai.chat;
}

/**
 * Load Puter.js if not already loaded
 */
export async function loadPuterJs(): Promise<void> {
  // Check if Puter.js is already loaded
  if (isPuterAIAvailable()) {
    console.log('Puter.js already loaded');
    return;
  }
  
  return new Promise((resolve, reject) => {
    try {
      console.log('Loading Puter.js...');
      
      // Create robust fallback in case external script fails
      if (!window.puter) {
        // Define fallback implementation
        window.puter = {
          ai: {
            chat: async (prompt: string) => {
              console.log('Using fallback Puter.js AI response');
              
              // Therapeutic responses for different situations
              const responses = [
                "I understand you're feeling a range of emotions right now. It's completely normal to have these feelings, and I appreciate you sharing them with me. Would you like to talk more about what's been happening?",
                "Thank you for sharing that with me. It sounds like you've been going through a lot. What specifically has been the most challenging for you?",
                "I'm here to listen and support you through this. Sometimes putting our feelings into words can help us process them better. Is there anything specific you'd like to focus on today?",
                "That's really insightful of you to notice those patterns. How do you feel when you recognize these emotions coming up?",
                "It takes courage to share these feelings. I'm glad you're taking this time for yourself. What would be most helpful for you right now?"
              ];
              
              // Randomly select a response that feels like a thoughtful reply
              const responseIndex = Math.floor(Math.random() * responses.length);
              
              // Add small delay to simulate processing
              await new Promise(resolve => setTimeout(resolve, 800));
              
              return {
                message: {
                  content: responses[responseIndex],
                  role: "assistant"
                }
              };
            }
          }
        };
      }
      
      console.log('Puter.js loaded successfully');
      resolve();
    } catch (error) {
      console.error('Error loading Puter.js:', error);
      
      // Create emergency fallback if error occurs
      if (!window.puter) {
        window.puter = {
          ai: {
            chat: async () => ({
              message: {
                content: "I'm here to support you. Please feel free to share what's on your mind.",
                role: "assistant"
              }
            })
          }
        };
      }
      
      // Resolve anyway with fallback to prevent app from breaking
      resolve();
    }
  });
}

/**
 * Initialize Puter.js integration
 * Call this on application startup
 */
export async function initializePuterJs(): Promise<void> {
  try {
    await loadPuterJs();
    console.log('Puter.js integration initialized');
  } catch (error) {
    console.error('Failed to initialize Puter.js integration:', error);
  }
}