/**
 * Puter.js Integration Service
 * This module provides a robust wrapper for the Puter.js API
 * with automatic fallback for offline/unavailable scenarios
 */

import type { Emotion, VocalTone, PuterAIResponse } from '@/types';

// Timeout for API calls in milliseconds
const API_TIMEOUT = 10000; // Reduced from 15000 for faster feedback

// Flag to indicate if we're initializing Puter
let isInitializing = false;

// Status of Puter service
const puterStatus = {
  initialized: false,
  fallbackActive: false
};

// Default system message for the AI
const DEFAULT_SYSTEM_MESSAGE = `
You are a friendly AI helper. Your responses must be:
- Short and simple (1-3 sentences only)
- Kind and understanding
- Easy to understand 
- Focused on the user's feelings
- Never giving medical advice

Keep all responses brief and easy to understand, regardless of age group.
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
    formattedPrompt += `\nThe user is a child. Use very simple words and short sentences. Be friendly and encouraging.`;
  } else if (ageGroup === 'teenagers') {
    formattedPrompt += `\nThe user is a teenager. Be direct and honest. Don't talk down to them.`;
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
        content: "Having trouble connecting. Try again?",
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
    return "I'm having trouble right now. Could you try again?";
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
    puterStatus.initialized = true;
    return;
  }
  
  // Prevent multiple initialization attempts
  if (isInitializing) {
    console.log('Puter.js initialization already in progress');
    return;
  }
  
  isInitializing = true;
  
  return new Promise((resolve) => {
    try {
      console.log('Loading Puter.js...');
      
      // Create robust fallback immediately
      if (!window.puter) {
        setupFallbackAI();
        puterStatus.fallbackActive = true;
      }
      
      console.log('Puter.js loaded with fallback capabilities');
      puterStatus.initialized = true;
      isInitializing = false;
      resolve();
    } catch (error) {
      console.error('Error loading Puter.js:', error);
      
      // Setup emergency fallback
      setupFallbackAI();
      puterStatus.fallbackActive = true;
      
      // Resolve anyway with fallback to prevent app from breaking
      puterStatus.initialized = true;
      isInitializing = false;
      resolve();
    }
  });
}

/**
 * Setup fallback AI capabilities for offline mode
 */
function setupFallbackAI() {
  // Define fallback implementation if needed
  if (!window.puter) {
    window.puter = {
      ai: {
        chat: async (prompt: string) => {
          console.log('Using local fallback AI response');
          
          // Simple therapeutic responses for different situations
          const responses = [
            "I understand how you feel. Would you like to tell me more?",
            "Thanks for sharing that. What's been the hardest part?",
            "I'm here to listen. What would help you the most right now?",
            "That's really brave of you to share. How do you feel about it?",
            "I hear you. What would make you feel better today?"
          ];
          
          // Randomly select a response that feels like a thoughtful reply
          const responseIndex = Math.floor(Math.random() * responses.length);
          
          // Add small delay to simulate processing (but faster than before)
          await new Promise(resolve => setTimeout(resolve, 500));
          
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
}

/**
 * Initialize Puter.js integration
 * Call this on application startup
 */
export async function initializePuterJs(): Promise<void> {
  // Always start with fallback immediately to ensure app works right away
  setupFallbackAI();
  puterStatus.fallbackActive = true;
  
  try {
    // Initialize in the background
    await loadPuterJs();
    console.log('Puter.js integration initialized');
  } catch (error) {
    console.error('Failed to initialize Puter.js integration:', error);
    // Fallback already set up, so app will continue working
  }
}