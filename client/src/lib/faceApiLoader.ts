import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';
import { Emotion } from '@/types';

// Model management flags
let isModelLoading = false;
let modelsLoaded = false;

// Store emotion history
const emotionHistory: Array<{emotion: Emotion, confidence: number, timestamp: Date}> = [];
const HISTORY_LENGTH = 5;
const MIN_CONFIDENCE = 0.2;

/**
 * Load the face-api.js models
 */
export const loadFaceModel = async (): Promise<void> => {
  if (modelsLoaded || isModelLoading) return;

  try {
    isModelLoading = true;
    console.log('Loading face landmarks detection model...');

    // Load models directly
    // Specify path for model files
    const modelPath = '/static/models';
    
    // Try to use the models directly from the root models directory
    console.log(`Loading models from: ${modelPath}`);
    
    try {
      // We're being more specific about model loading
      console.log('Loading tiny face detector model...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
      console.log('Tiny face detector model loaded');
      
      console.log('Loading face landmark model...');
      await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
      console.log('Face landmark model loaded');
      
      console.log('Loading face expression model...');
      await faceapi.nets.faceExpressionNet.loadFromUri(modelPath);
      console.log('Face expression model loaded');
    } catch (modelError) {
      console.error('Error loading specific model:', modelError);
      throw modelError;
    }

    modelsLoaded = true;
    console.log('Face landmarks model loaded successfully!');
  } catch (error) {
    console.error('Error loading face landmarks model:', error);
    console.error('Details:', JSON.stringify(error));
    
    // Don't throw the error, allow the application to continue
    // but mark models as not loaded
    modelsLoaded = false;
  } finally {
    isModelLoading = false;
  }
};

// Alias for backward compatibility
export const loadFaceApiScript = loadFaceModel;
export const loadFaceApiModels = loadFaceModel;

/**
 * Main function to detect facial emotion from a video element
 */
export const detectFacialEmotion = async (
  video: HTMLVideoElement
): Promise<{ emotion: Emotion; confidence: number } | null> => {
  if (!modelsLoaded || !video) return null;

  try {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (!detection) return null;

    // Map expressions to our emotion types
    const expressions = detection.expressions;
    const emotionMap: { [key: string]: Emotion } = {
      neutral: 'neutral',
      happy: 'happy',
      sad: 'sad',
      angry: 'angry',
      fearful: 'fearful',
      disgusted: 'disgusted',
      surprised: 'surprised'
    };

    let maxConfidence = 0;
    let dominantEmotion: Emotion = 'neutral';

    Object.entries(expressions).forEach(([expression, confidence]) => {
      if (confidence > maxConfidence && emotionMap[expression]) {
        maxConfidence = confidence;
        dominantEmotion = emotionMap[expression];
      }
    });

    if (maxConfidence < MIN_CONFIDENCE) return null;

    // Add to history with timestamp
    const result = { emotion: dominantEmotion, confidence: maxConfidence, timestamp: new Date() };
    emotionHistory.push(result);
    if (emotionHistory.length > HISTORY_LENGTH) {
      emotionHistory.shift();
    }

    return result;
  } catch (error) {
    console.error('Error detecting facial emotion:', error);
    return null;
  }
};

// Export emotion history getter
export const getEmotionHistory = () => emotionHistory;

/**
 * Check if model is loaded and ready for use
 */
export const isModelLoaded = (): boolean => modelsLoaded;

function getStableEmotion(): { emotion: Emotion; confidence: number } | null {
  if (emotionHistory.length < 3) return null;

  // Count occurrences of each emotion in history
  const emotionCounts = new Map<Emotion, number>();
  let totalConfidence = 0;

  emotionHistory.forEach(({ emotion, confidence }) => {
    emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
    totalConfidence += confidence;
  });

  // Find most frequent emotion
  let maxCount = 0;
  let stableEmotion: Emotion | null = null;

  emotionCounts.forEach((count, emotion) => {
    if (count > maxCount) {
      maxCount = count;
      stableEmotion = emotion;
    }
  });

  // Require emotion to appear in majority of recent frames
  if (stableEmotion && maxCount >= Math.ceil(emotionHistory.length / 2)) {
    return {
      emotion: stableEmotion,
      confidence: totalConfidence / emotionHistory.length
    };
  }

  return null;
}