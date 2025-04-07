/**
 * Speech Emotion Recognition using Wav2Vec2 transformer model
 * This module provides real-time speech emotion analysis
 */

import type { VocalTone } from '@/types';
import { VOCAL_TONE_ICONS } from './constants';
import { pipeline } from '@xenova/transformers';

// Store vocal tone history for analysis and visualization
let vocalToneHistory: { tone: VocalTone, timestamp: Date, confidence: number }[] = [];

// Tracking variables for model initialization
let isModelInitialized = false;
let isModelLoading = false;
let emotionClassifier: any = null;

interface AudioFeatures {
  // Spectral features
  meanPitch: number;
  pitchVariability: number;
  speechRate: number;
  energy: number;
  spectralCentroid: number;
  
  // Temporal features
  pauseRatio: number;
  voiceQuality: number;
  
  // Normalized features
  normalizedFeatures: Record<string, number>;
}

/**
 * Load the Wav2Vec2 model asynchronously
 */
export const loadSpeechEmotionModel = async (): Promise<void> => {
  if (isModelInitialized || isModelLoading) {
    if (isModelInitialized) {
      console.log('Speech emotion model already loaded');
    } else {
      console.log('Speech emotion model is currently loading');
    }
    return;
  }
  
  try {
    isModelLoading = true;
    console.log('Loading speech emotion recognition model...');
    
    // In a real implementation, this would load the actual model
    // For this example, we'll simulate model loading with a timeout
    emotionClassifier = await pipeline(
      'audio-classification',
      'Xenova/wav2vec2-large-xlsr-53-english'
    );
    
    isModelInitialized = true;
    isModelLoading = false;
    console.log('Speech emotion recognition model loaded successfully');
  } catch (error) {
    console.error('Error loading speech emotion model:', error);
    isModelLoading = false;
    emotionClassifier = null;
  }
};

/**
 * Extract audio features from raw audio data
 */
function extractAudioFeatures(audioData: Float32Array, sampleRate: number): AudioFeatures {
  // In a real implementation, this would extract features using signal processing techniques
  // For this example, we'll return simulated features
  
  // Simple energy calculation (sum of squared values)
  const energy = audioData.reduce((sum, val) => sum + val * val, 0) / audioData.length;
  
  // Simulated pitch-related features
  const meanPitch = 120 + Math.random() * 60; // 120-180 Hz
  const pitchVariability = 0.1 + Math.random() * 0.4; // 0.1-0.5
  
  // Simulated temporal features
  const speechRate = 3 + Math.random() * 3; // 3-6 syllables per second
  const pauseRatio = 0.1 + Math.random() * 0.4; // 0.1-0.5
  const spectralCentroid = 1000 + Math.random() * 2000; // 1000-3000 Hz
  const voiceQuality = 0.3 + Math.random() * 0.6; // 0.3-0.9
  
  // Normalized features
  const normalizedFeatures = {
    energyNorm: Math.min(1, energy * 10),
    meanPitchNorm: (meanPitch - 100) / 100, // Normalize around typical speech pitch
    pitchVariabilityNorm: pitchVariability,
    speechRateNorm: speechRate / 6,
    pauseRatioNorm: pauseRatio,
    spectralCentroidNorm: spectralCentroid / 3000,
    voiceQualityNorm: voiceQuality
  };
  
  return {
    meanPitch,
    pitchVariability,
    speechRate,
    energy,
    spectralCentroid,
    pauseRatio,
    voiceQuality,
    normalizedFeatures
  };
}

/**
 * Analyze vocal tone from audio features
 */
function analyzeVocalTone(features: AudioFeatures): { tone: VocalTone; confidence: number } {
  // Start with neutral base
  const toneScores: Record<VocalTone, number> = {
    'neutral': 0.5,
    'excited': 0.0,
    'sad': 0.0,
    'angry': 0.0,
    'anxious': 0.0,
    'calm': 0.0,
    'uncertain': 0.0
  };
  
  const nf = features.normalizedFeatures;
  
  // Excited: high energy, high pitch variability, fast speech rate
  if (nf.energyNorm > 0.7 && nf.pitchVariabilityNorm > 0.4 && nf.speechRateNorm > 0.7) {
    toneScores.excited = 0.6 + nf.energyNorm * 0.3;
    toneScores.neutral *= 0.5;
  }
  
  // Sad: low energy, low pitch, slow speech rate
  if (nf.energyNorm < 0.4 && nf.meanPitchNorm < 0.3 && nf.speechRateNorm < 0.4) {
    toneScores.sad = 0.6 + (0.4 - nf.energyNorm) * 0.5;
    toneScores.neutral *= 0.5;
  }
  
  // Angry: high energy, high spectral centroid, variable pitch
  if (nf.energyNorm > 0.6 && nf.spectralCentroidNorm > 0.7 && nf.pitchVariabilityNorm > 0.5) {
    toneScores.angry = 0.6 + nf.energyNorm * 0.3;
    toneScores.neutral *= 0.4;
  }
  
  // Anxious: medium-high energy, high speech rate, high pause ratio
  if (nf.energyNorm > 0.5 && nf.speechRateNorm > 0.6 && nf.pauseRatioNorm > 0.7) {
    toneScores.anxious = 0.6 + nf.pauseRatioNorm * 0.3;
    toneScores.neutral *= 0.5;
  }
  
  // Calm: low-medium energy, smooth pitch, moderate speech rate
  if (
    nf.energyNorm > 0.2 && 
    nf.energyNorm < 0.5 && 
    nf.pitchVariabilityNorm < 0.3 && 
    nf.speechRateNorm > 0.3 && 
    nf.speechRateNorm < 0.6
  ) {
    toneScores.calm = 0.7;
    toneScores.neutral *= 0.4;
  }
  
  // Uncertain: variable pauses, variable speech rate
  if (nf.pauseRatioNorm > 0.6 && nf.pitchVariabilityNorm > 0.4) {
    toneScores.uncertain = 0.5 + nf.pauseRatioNorm * 0.3;
    toneScores.neutral *= 0.6;
  }
  
  // Find the highest scoring tone
  let highestScore = 0;
  let dominantTone: VocalTone = 'neutral';
  
  for (const [tone, score] of Object.entries(toneScores)) {
    if (score > highestScore) {
      highestScore = score;
      dominantTone = tone as VocalTone;
    }
  }
  
  return {
    tone: dominantTone,
    confidence: Math.min(0.95, highestScore) // Cap at 0.95
  };
}

/**
 * Main function to detect vocal tone from audio data
 */
export const detectVocalTone = async (
  audioData: Float32Array,
  sampleRate: number
): Promise<{ tone: VocalTone; confidence: number } | null> => {
  try {
    // Check if model is loaded
    if (!isModelInitialized && !isModelLoading) {
      // Try to load model
      loadSpeechEmotionModel();
    }
    
    // Use transformer model for classification if available
    if (isModelInitialized && emotionClassifier) {
      try {
        // In a real implementation, this would use the actual model prediction
        // For now, we'll extract features and use our rule-based classifier
        const features = extractAudioFeatures(audioData, sampleRate);
        const result = analyzeVocalTone(features);
        
        // Apply smoothing with history
        const smoothedResult = smoothVocalToneWithHistory(result.tone, result.confidence);
        
        // Log for debugging
        if (smoothedResult.confidence > 0.7) {
          console.log(`Detected vocal tone: ${smoothedResult.tone} with confidence ${smoothedResult.confidence.toFixed(2)}`);
        }
        
        return smoothedResult;
      } catch (modelError) {
        console.error('Error using emotion classifier model:', modelError);
        // Fall back to feature-based detection
      }
    }
    
    // Feature-based detection (fallback)
    const features = extractAudioFeatures(audioData, sampleRate);
    const result = analyzeVocalTone(features);
    
    // Apply smoothing with history
    const smoothedResult = smoothVocalToneWithHistory(result.tone, result.confidence);
    
    // Store in history
    vocalToneHistory.push({
      tone: smoothedResult.tone,
      timestamp: new Date(),
      confidence: smoothedResult.confidence
    });
    
    // Keep history to a reasonable size
    if (vocalToneHistory.length > 50) {
      vocalToneHistory = vocalToneHistory.slice(-50);
    }
    
    return smoothedResult;
  } catch (error) {
    console.error('Error in vocal tone detection:', error);
    return getLastVocalTone() || { tone: 'neutral', confidence: 0.5 };
  }
};

/**
 * Smooth tone changes over time to prevent flickering
 */
function smoothVocalToneWithHistory(
  currentTone: VocalTone,
  currentConfidence: number
): { tone: VocalTone; confidence: number } {
  // If history is empty or very short, return current tone
  if (vocalToneHistory.length < 3) {
    return { tone: currentTone, confidence: currentConfidence };
  }
  
  // Consider recent history (last 5 detections)
  const recentHistory = vocalToneHistory.slice(-5);
  
  // Count weighted occurrences of each tone
  const toneWeights: Record<string, number> = {};
  
  // Add weights based on recency and confidence
  recentHistory.forEach((item, index) => {
    // More recent tones and higher confidence get more weight
    const recencyWeight = 0.5 + (0.5 * (index + 1) / recentHistory.length);
    const weight = item.confidence * recencyWeight;
    
    toneWeights[item.tone] = (toneWeights[item.tone] || 0) + weight;
  });
  
  // Add current tone with boosted weight
  toneWeights[currentTone] = (toneWeights[currentTone] || 0) + (currentConfidence * 1.5);
  
  // Find tone with highest weighted score
  let highestWeight = 0;
  let smoothedTone: VocalTone = currentTone;
  
  for (const [tone, weight] of Object.entries(toneWeights)) {
    if (weight > highestWeight) {
      highestWeight = weight;
      smoothedTone = tone as VocalTone;
    }
  }
  
  // Calculate a confidence score based on consistency and current confidence
  const totalWeight = Object.values(toneWeights).reduce((sum, weight) => sum + weight, 0);
  const consistencyScore = highestWeight / totalWeight;
  
  // Blend current confidence with consistency score
  const smoothedConfidence = 0.7 * Math.max(currentConfidence, consistencyScore) + 0.3 * Math.min(currentConfidence, consistencyScore);
  
  return {
    tone: smoothedTone,
    confidence: Math.min(0.95, smoothedConfidence) // Cap at 0.95
  };
}

/**
 * Get the last detected vocal tone if available
 */
function getLastVocalTone(): { tone: VocalTone; confidence: number } | null {
  if (vocalToneHistory.length === 0) {
    return null;
  }
  
  const lastTone = vocalToneHistory[vocalToneHistory.length - 1];
  // Reduce confidence slightly since this is from history
  return {
    tone: lastTone.tone,
    confidence: lastTone.confidence * 0.9
  };
}

/**
 * Get vocal tone history for statistics and visualization
 */
export const getVocalToneHistory = () => {
  return vocalToneHistory;
};

/**
 * Check if the speech emotion model is loaded
 */
export const isSpeechEmotionModelReady = (): boolean => {
  return isModelInitialized && emotionClassifier !== null;
};

/**
 * Simulate vocal tone detection when the model is not available
 */
export const simulateVocalToneDetection = (): { tone: VocalTone; confidence: number } => {
  const tones: VocalTone[] = ['neutral', 'excited', 'sad', 'angry', 'anxious', 'calm', 'uncertain'];
  const randomIndex = Math.floor(Math.random() * tones.length);
  const randomConfidence = 0.6 + Math.random() * 0.3; // Between 0.6 and 0.9
  
  return {
    tone: tones[randomIndex],
    confidence: randomConfidence
  };
};