import { useState, useEffect, useRef, useCallback } from 'react';
import { Emotion } from '@/types';
import { loadFaceModel, detectFacialEmotion, isModelLoaded } from '@/lib/faceApiLoader';

interface UseFaceDetectionProps {
  isEnabled: boolean;
  detectInterval?: number; // ms between detection attempts
  onEmotionDetected?: (emotion: { emotion: Emotion; confidence: number }) => void;
}

export function useFaceDetection({ 
  isEnabled, 
  detectInterval = 500, // faster interval for more responsive detection
  onEmotionDetected 
}: UseFaceDetectionProps) {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [emotionConfidence, setEmotionConfidence] = useState<number>(0);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectIntervalRef = useRef<number | null>(null);

  // Load face detection models
  useEffect(() => {
    const initializeModels = async () => {
      if (isModelLoaded()) {
        setIsReady(true);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Initializing face detection models...');
        await loadFaceModel();
        
        // Check if models were actually loaded
        const loaded = isModelLoaded();
        setIsReady(loaded);
        
        if (!loaded) {
          setError('Models loaded but not properly initialized. Please refresh the page.');
          console.warn('Models loaded but not properly initialized');
        } else {
          console.log('Face detection models ready to use');
        }
      } catch (err) {
        console.error('Error loading face detection models:', err);
        setError('Failed to load facial recognition models. Camera features will be limited.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeModels();

    // Cleanup function
    return () => {
      if (detectIntervalRef.current) {
        window.clearInterval(detectIntervalRef.current);
        detectIntervalRef.current = null;
      }
    };
  }, []);

  // Request camera access
  const startCamera = useCallback(async () => {
    if (!isReady || !isEnabled) return;
    
    try {
      setError(null);
      // Request camera with adaptive constraints for better face detection on any device
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 },
          facingMode: 'user',
          aspectRatio: { ideal: 1.33333 }, // 4:3 aspect ratio for better face detection
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be loaded before starting detection
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            setCameraActive(true);
            setPermission(true);
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera access for emotion detection.'
          : 'Failed to access camera'
      );
      setPermission(false);
    }
  }, [isReady, isEnabled]);

  // Stop camera and cleanup
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (detectIntervalRef.current) {
      window.clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
    
    setCameraActive(false);
  }, []);

  // Start emotion detection loop
  useEffect(() => {
    if (!cameraActive || !isEnabled || !videoRef.current) {
      return;
    }

    const detectEmotion = async () => {
      if (!videoRef.current || !cameraActive) return;
      
      try {
        const result = await detectFacialEmotion(videoRef.current);
        
        if (result) {
          setCurrentEmotion(result.emotion);
          setEmotionConfidence(result.confidence);
          
          if (onEmotionDetected) {
            onEmotionDetected(result);
          }
        }
      } catch (err) {
        console.error('Error in emotion detection:', err);
      }
    };

    // Clear any existing intervals
    if (detectIntervalRef.current) {
      window.clearInterval(detectIntervalRef.current);
    }
    
    // Start detection loop at specified interval
    detectIntervalRef.current = window.setInterval(detectEmotion, detectInterval);
    
    return () => {
      if (detectIntervalRef.current) {
        window.clearInterval(detectIntervalRef.current);
      }
    };
  }, [cameraActive, isEnabled, detectInterval, onEmotionDetected]);

  // Start or stop camera based on isEnabled prop
  useEffect(() => {
    if (isEnabled && isReady && !cameraActive) {
      startCamera();
    } else if (!isEnabled && cameraActive) {
      stopCamera();
    }
  }, [isEnabled, isReady, cameraActive, startCamera, stopCamera]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isReady,
    isLoading,
    error,
    permission,
    cameraActive,
    currentEmotion,
    emotionConfidence,
    startCamera,
    stopCamera
  };
}