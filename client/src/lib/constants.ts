import { Emotion, VocalTone } from "@/types";

export const EMOTION_ICONS: Record<Emotion, string> = {
  neutral: "😐",
  happy: "😃",
  sad: "😔",
  angry: "😠",
  surprised: "😲",
  fearful: "😨",
  disgusted: "🤢",
  calm: "😌",
  tense: "😣"
};

export const VOCAL_TONE_ICONS: Record<VocalTone, string> = {
  neutral: "🎧",
  excited: "⚡",
  sad: "🌧️",
  angry: "🔥",
  anxious: "📈",
  calm: "🍃",
  uncertain: "❓"
};

export const THERAPY_INSTRUCTIONS = {
  voice: [
    "Click \"Enable Voice & Camera\" to start speech recognition and emotion detection",
    "Speak naturally about your thoughts and feelings",
    "The AI analyzes your facial expressions and vocal tone to provide personalized responses",
    "Your message will be sent automatically when you pause speaking",
    "You can continue the conversation as long as you need"
  ],
  text: [
    "Type your message in the input field below the conversation",
    "Press Enter or click the send button to submit your message",
    "The AI will respond with therapeutic guidance based on your input",
    "Continue the conversation as long as you need",
    "Your conversation history is displayed in the chat window"
  ]
};

export const PRIVACY_NOTE = "All conversations are private and confidential. Your data is processed locally and is not stored after you close the session.";

export const INITIAL_MESSAGES = {
  voice: "Hello! I'm your AI therapist. I can analyze your facial expressions and voice tone to provide more personalized support. How are you feeling today?",
  text: "Hello! I'm your AI therapist. How can I help you today?"
};

export const LANGUAGE_COMPLEXITY_LEVELS = [
  {
    name: "Children",
    description: "Simple language suitable for children",
    maxWordLength: 6,
    maxSentenceLength: 8,
    ageGroup: "5-12 years",
    instructions: "Use simple words and short sentences. Avoid complex concepts. Use concrete examples rather than abstract ideas. Be warm, friendly and encouraging. Explain things using familiar concepts like family, friends, school, and play. Keep your tone gentle and supportive.",
    examples: "I understand you feel sad. That's okay! Everyone feels sad sometimes. Would you like to talk about what made you sad? Maybe we can think of something fun to do that might help you feel better."
  },
  {
    name: "Teenagers",
    description: "Casual language with age-appropriate concepts",
    maxWordLength: 10,
    maxSentenceLength: 15,
    ageGroup: "13-17 years",
    instructions: "Use casual but respectful language. Include some relatable references and examples. Acknowledge independence while offering guidance. Use a mix of simple and moderately complex sentences. Address topics like peer relationships, identity, and future goals in an approachable way.",
    examples: "I hear that you're feeling frustrated with your friends lately. That's totally normal during high school. Sometimes friendships go through rough patches as everyone figures out who they are. What do you think is the main issue that's bothering you right now?"
  },
  {
    name: "Adults",
    description: "Professional therapeutic language",
    maxWordLength: 15,
    maxSentenceLength: 25,
    ageGroup: "18+ years",
    instructions: "Use professional therapeutic language with appropriate depth and complexity. Incorporate psychological concepts when relevant. Balance analytical insight with emotional support. Use nuanced language that acknowledges the complexity of adult experiences. Maintain a professional yet approachable tone.",
    examples: "I understand you're experiencing significant anxiety related to your career transition. Such major life changes often trigger complex emotional responses, including uncertainty about identity and purpose. Would it help to explore some cognitive strategies for managing these feelings, or would you prefer to discuss the underlying concerns about this professional shift?"
  }
];
