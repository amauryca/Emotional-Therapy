export interface TherapyMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  mood?: {
    emotion?: Emotion;
    tone?: VocalTone;
  };
}

export type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted' | 'calm' | 'tense';

export type VocalTone = 'neutral' | 'excited' | 'sad' | 'angry' | 'anxious' | 'calm' | 'uncertain';

export interface EmotionDetection {
  emotion: Emotion;
  confidence: number;
}

export interface VocalToneDetection {
  tone: VocalTone;
  confidence: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export interface SpeechToTextResult {
  text: string;
  confidence: number;
}

export interface PuterAIResponse {
  message: {
    content: string;
    role: string;
    id?: string;
  }
}
