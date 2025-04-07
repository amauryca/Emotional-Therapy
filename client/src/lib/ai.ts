import { Emotion, VocalTone } from "@/types";

import { detectFacialEmotion } from './faceApiLoader';

export const detectEmotion = async (
  video: HTMLVideoElement | null
): Promise<{ emotion: Emotion; confidence: number } | null> => {
  if (!video) {
    console.log('Video element not available for emotion detection');
    return null;
  }

  try {
    // Use the new TensorFlow.js-based emotion detection
    const emotionResult = await detectFacialEmotion(video);
    if (emotionResult) {
      return emotionResult;
    }
  } catch (error) {
    console.error('Error in emotion detection:', error);
  }

  // Return null if detection failed
  return null;
};

// Use this function until face-api models are loaded or when detection fails
export const simulateEmotionDetection = (): { emotion: Emotion; confidence: number } => {
  const emotions: Emotion[] = ['neutral', 'happy', 'sad', 'calm', 'surprised'];
  const randomIndex = Math.floor(Math.random() * emotions.length);
  
  return {
    emotion: emotions[randomIndex], 
    confidence: 0.7 + Math.random() * 0.3 // Random confidence between 0.7 and 1.0
  };
};

// Store vocal tone history for statistics and smoothing
let vocalToneHistory: { tone: VocalTone, timestamp: Date, confidence: number }[] = [];

// Get vocal tone history for statistics
export const getVocalToneHistory = () => {
  return vocalToneHistory;
};

// Advanced vocal tone analysis based on text content, patterns, and history
export const detectVocalTone = (
  transcript: string,
  previousTranscript?: string
): { tone: VocalTone; confidence: number } => {
  if (!transcript || transcript.trim().length === 0) {
    return { tone: 'neutral', confidence: 0.5 };
  }
  
  // Normalize and clean text
  const lowerText = transcript.toLowerCase().trim();
  
  // Analyze text features
  const features = {
    exclamationCount: (transcript.match(/!/g) || []).length,
    questionCount: (transcript.match(/\?/g) || []).length,
    capitalsRatio: countUppercaseLetters(transcript) / Math.max(1, transcript.length),
    wordCount: transcript.split(/\s+/).filter(w => w.length > 0).length,
    avgWordLength: calculateAvgWordLength(transcript),
    sentenceCount: (transcript.match(/[.!?]+/g) || []).length,
    repetition: detectRepetition(transcript),
    stopWords: countStopWords(lowerText),
    punctuationDensity: countPunctuation(transcript) / Math.max(1, transcript.length),
  };
  
  // Enhanced word markers with weights
  const wordMarkers: Record<VocalTone, { words: string[], weight: number }> = {
    neutral: { 
      words: ['normal', 'fine', 'okay', 'ok', 'alright', 'good', 'well', 'sure', 'yes', 'no'],
      weight: 1.0 
    },
    excited: { 
      words: ['excited', 'happy', 'great', 'amazing', 'wonderful', 'fantastic', 'awesome', 'excellent', 'love', 'wow', 'cool', 'best', 'fun', 'delighted', 'thrilled', 'perfect', 'brilliant'],
      weight: 1.2 
    },
    sad: { 
      words: ['sad', 'depressed', 'unhappy', 'disappointed', 'sorry', 'miss', 'lost', 'hurt', 'alone', 'painful', 'grief', 'crying', 'regret', 'unfortunate', 'hopeless', 'heartbroken', 'miserable'],
      weight: 1.5  // Sad words tend to be stronger indicators
    },
    angry: { 
      words: ['angry', 'upset', 'mad', 'furious', 'hate', 'terrible', 'worst', 'annoying', 'frustrated', 'irritated', 'outraged', 'unfair', 'ridiculous', 'wrong', 'awful', 'stupid', 'bad'],
      weight: 1.5  // Anger words are strong indicators
    },
    anxious: { 
      words: ['worried', 'anxious', 'nervous', 'scared', 'afraid', 'stress', 'panic', 'concerned', 'uncertain', 'fear', 'frightened', 'terrified', 'uneasy', 'tense', 'overwhelmed', 'doubt'],
      weight: 1.3 
    },
    calm: { 
      words: ['calm', 'relaxed', 'peaceful', 'balanced', 'quiet', 'comfortable', 'content', 'steady', 'composed', 'tranquil', 'serene', 'patient', 'gentle', 'steady', 'stable'],
      weight: 1.1 
    },
    uncertain: { 
      words: ['maybe', 'perhaps', 'not sure', 'might', 'guess', 'possibly', 'uncertain', 'confused', 'unclear', 'wonder', 'unsure', 'doubt', 'confusing', 'complicated', 'hard to say', 'thinking'],
      weight: 1.2 
    }
  };
  
  // Count occurrences of word markers with weighted scoring
  const scores: Record<VocalTone, number> = {
    neutral: 0,
    excited: 0,
    sad: 0,
    angry: 0,
    anxious: 0,
    calm: 0,
    uncertain: 0
  };
  
  // Initialize with small baseline scores based on text features
  if (features.exclamationCount > 0) {
    scores.excited += features.exclamationCount * 0.3;
    scores.angry += features.exclamationCount * 0.1;
  }
  
  if (features.questionCount > 0) {
    scores.uncertain += features.questionCount * 0.3;
  }
  
  if (features.capitalsRatio > 0.25) {
    scores.excited += features.capitalsRatio * 1.5;
    scores.angry += features.capitalsRatio * 2;
  }
  
  if (features.repetition > 0.3) {
    scores.anxious += features.repetition * 1.5;
    scores.uncertain += features.repetition;
  }
  
  // Process word markers with weights
  for (const [tone, { words, weight }] of Object.entries(wordMarkers)) {
    for (const word of words) {
      try {
        // Word boundary check for more accurate matching
        const pattern = word.length > 1 ? `\\b${word}\\b` : word;
        const regex = new RegExp(pattern, 'gi');
        const matches = lowerText.match(regex);
        
        if (matches) {
          scores[tone as VocalTone] += matches.length * weight;
          
          // Check for intensifiers near emotional words
          matches.forEach(match => {
            const position = lowerText.indexOf(match.toLowerCase());
            const context = lowerText.substring(
              Math.max(0, position - 20),
              Math.min(lowerText.length, position + match.length + 20)
            );
            
            const hasIntensifier = /\b(very|really|so|extremely|absolutely|totally|completely|deeply|highly|terribly|incredibly)\b/i.test(context);
            if (hasIntensifier) {
              scores[tone as VocalTone] += 0.5 * weight;
            }
          });
        }
      } catch (e) {
        // Fallback to simple counting
        const occurrences = (lowerText.split(word).length - 1);
        if (occurrences > 0) {
          scores[tone as VocalTone] += occurrences * weight;
        }
      }
    }
  }
  
  // Analyze sentence structure for additional signals
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length > 0) {
    // Short, abrupt sentences may indicate anger or anxiety
    const avgSentenceLength = transcript.length / sentences.length;
    if (avgSentenceLength < 15 && sentences.length >= 2) {
      scores.angry += 0.5;
      scores.anxious += 0.3;
    }
    
    // Long, flowing sentences may indicate calmness or thoughtfulness
    if (avgSentenceLength > 40) {
      scores.calm += 0.5;
    }
  }
  
  // Get the dominant tone based on highest score
  let maxScore = 0;
  let dominantTone: VocalTone = 'neutral';
  
  for (const [tone, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantTone = tone as VocalTone;
    }
  }
  
  // Calculate confidence (0.5-1.0 range)
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  let confidence = 0.5; // Minimum baseline
  
  if (totalScore > 0) {
    // Normalized confidence based on score distribution
    confidence = 0.5 + Math.min(0.5, (maxScore / totalScore) * 0.7);
  }
  
  // Default to neutral if no strong signals
  if (maxScore < 0.5) {
    dominantTone = 'neutral';
    confidence = 0.5;
  }
  
  // Apply smoothing with history
  const result = smoothVocalToneWithHistory(dominantTone, confidence);
  
  // Store result in history for future smoothing and statistics
  vocalToneHistory.push({
    tone: result.tone,
    confidence: result.confidence,
    timestamp: new Date()
  });
  
  // Limit history size
  if (vocalToneHistory.length > 100) {
    vocalToneHistory = vocalToneHistory.slice(-100);
  }
  
  return result;
};

// Smooth vocal tone detection to avoid rapid changes
function smoothVocalToneWithHistory(
  currentTone: VocalTone, 
  confidence: number
): { tone: VocalTone; confidence: number } {
  // If first detection or very high confidence, use as is
  if (vocalToneHistory.length === 0 || confidence > 0.85) {
    return { tone: currentTone, confidence };
  }
  
  // Consider recent history (last 3)
  const recentHistory = vocalToneHistory.slice(-3);
  const toneCounts: Record<string, number> = {};
  
  recentHistory.forEach(item => {
    toneCounts[item.tone] = (toneCounts[item.tone] || 0) + 1;
  });
  
  // If current tone is already present in history, keep it
  if (toneCounts[currentTone] >= 1) {
    return { tone: currentTone, confidence: confidence * 1.05 };
  }
  
  // If another tone is dominant, require higher confidence to change
  const mostFrequentTone = Object.entries(toneCounts)
    .sort((a, b) => b[1] - a[1])[0][0] as VocalTone;
  
  // Require stronger evidence to switch from the dominant tone
  if (confidence > 0.7) {
    return { tone: currentTone, confidence };
  } else {
    // Stay with most frequent tone
    return { tone: mostFrequentTone, confidence: 0.6 };
  }
}

// Helper function to count uppercase letters
function countUppercaseLetters(text: string): number {
  return (text.match(/[A-Z]/g) || []).length;
}

// Helper function to calculate average word length
function calculateAvgWordLength(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 0;
  
  const totalLength = words.reduce((sum, word) => sum + word.length, 0);
  return totalLength / words.length;
}

// Helper function to detect repetition in text
function detectRepetition(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length < 4) return 0;
  
  const uniqueWords = new Set(words);
  // Repetition ratio - lower means more repetition
  return uniqueWords.size / words.length;
}

// Helper function to count common stop words
function countStopWords(text: string): number {
  const stopWords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 
    'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 
    'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 
    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 
    'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 
    'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'];
  
  const words = text.split(/\s+/);
  let count = 0;
  
  for (const word of words) {
    if (stopWords.includes(word)) {
      count++;
    }
  }
  
  return count;
}

// Helper function to count punctuation
function countPunctuation(text: string): number {
  return (text.match(/[.,!?;:'"()\[\]{}]/g) || []).length;
}

// Function to simulate vocal tone detection when needed
export const simulateVocalToneDetection = (): { tone: VocalTone; confidence: number } => {
  const tones: VocalTone[] = ['neutral', 'excited', 'sad', 'angry', 'anxious', 'calm', 'uncertain'];
  const randomIndex = Math.floor(Math.random() * tones.length);
  const randomConfidence = Math.random() * 0.5 + 0.5; // Between 0.5 and 1.0
  
  return {
    tone: tones[randomIndex],
    confidence: randomConfidence
  };
};

// AI text processing for language complexity
export const processTextComplexity = (
  text: string,
  complexityLevel: number // 0=simple, 1=moderate, 2=advanced
): string => {
  if (!text) return text;
  
  try {
    // Process based on complexity level
    let processedText = text;
    
    // For simple complexity, try to shorten sentences and words
    if (complexityLevel === 0) {
      // Replace complex words with simpler alternatives
      const complexWords: Record<string, string> = {
        'utilize': 'use',
        'facilitate': 'help',
        'implement': 'use',
        'subsequently': 'then',
        'additionally': 'also',
        'regarding': 'about',
        'initiate': 'start',
        'terminate': 'end',
        'modification': 'change',
        'approximately': 'about',
        'significantly': 'a lot',
        'expedite': 'speed up',
        'endeavor': 'try',
        'prioritize': 'focus on',
        'consequently': 'so',
        'nevertheless': 'still',
        'furthermore': 'also',
        'therefore': 'so',
        'comprehend': 'understand',
        'inquire': 'ask'
      };
      
      // Replace complex words
      for (const [complex, simple] of Object.entries(complexWords)) {
        const regex = new RegExp(`\\b${complex}\\b`, 'gi');
        processedText = processedText.replace(regex, simple);
      }
    }
    
    return processedText;
    
  } catch (error) {
    console.error('Error processing text complexity:', error);
    return text; // Return original text if processing failed
  }
};
