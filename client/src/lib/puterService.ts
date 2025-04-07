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
      // In a real implementation, this would load the actual Puter.js script
      // For this example, we'll simulate a global puter object
      
      // Simulate Puter.js loading
      console.log('Loading Puter.js...');
      
      // Create mock puter.js functionality if not already available
      if (!window.puter) {
        window.puter = {
          ai: {
            chat: async (prompt: string) => {
              // Simulate API call delay
              await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
              
              console.log('Puter.js AI called with prompt:', prompt.substring(0, 50) + '...');
              
              // Return a simulated response
              return {
                message: {
                  content: "I understand you're feeling a range of emotions right now. It's completely normal to have these feelings, and I appreciate you sharing them with me. Would you like to talk more about what's been happening?",
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
      reject(error);
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