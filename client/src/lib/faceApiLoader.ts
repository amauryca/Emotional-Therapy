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
    console.log('Loading face detection models...');

    // Set the base path where all models are located
    const modelBasePath = '/models';
    
    console.log(`Loading models from base path: ${modelBasePath}`);
    
    // First validate if model files are accessible by manually testing access
    // to one of the model manifest files
    try {
      console.log('Validating model files accessibility...');
      const testResponse = await fetch(`${modelBasePath}/tiny_face_detector/tiny_face_detector_model-weights_manifest.json`);
      
      if (!testResponse.ok) {
        throw new Error(`Failed to access model file: ${testResponse.status} ${testResponse.statusText}`);
      }
      
      const manifestJson = await testResponse.json();
      console.log('Model manifest accessible:', manifestJson ? 'Yes' : 'No');
    } catch (error) {
      console.error('Model validation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error accessing model files';
      throw new Error(`Model files validation failed: ${errorMessage}`);
    }
    
    try {
      // Use a more atomic approach to load models individually 
      // with explicit directory paths
      console.log('Loading tiny face detector model...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(`${modelBasePath}/tiny_face_detector`);
      console.log('Tiny face detector model loaded successfully');
      
      console.log('Loading face landmark model...');
      await faceapi.nets.faceLandmark68Net.loadFromUri(`${modelBasePath}/face_landmark_68`);
      console.log('Face landmark model loaded successfully');
      
      console.log('Loading face expression model...');
      await faceapi.nets.faceExpressionNet.loadFromUri(`${modelBasePath}/face_expression`);
      console.log('Face expression model loaded successfully');
    } catch (modelError) {
      console.error('Error loading specific model:', modelError);
      if (modelError instanceof Error) {
        console.error('Model error message:', modelError.message);
        console.error('Model error stack:', modelError.stack);
      } else {
        console.error('Model error details:', JSON.stringify(modelError, null, 2));
      }
      throw modelError;
    }

    modelsLoaded = true;
    console.log('Face landmarks model loaded successfully!');
  } catch (error) {
    console.error('Error loading face landmarks model:', error);
    
    // Try to provide more helpful error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', typeof error);
      console.error('Details:', JSON.stringify(error, null, 2));
    }
    
    // Log information about model loading state
    console.error('Model loading state:', {
      tinyFaceDetector: faceapi.nets.tinyFaceDetector.isLoaded,
      faceLandmark68Net: faceapi.nets.faceLandmark68Net.isLoaded,
      faceExpressionNet: faceapi.nets.faceExpressionNet.isLoaded
    });
    
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