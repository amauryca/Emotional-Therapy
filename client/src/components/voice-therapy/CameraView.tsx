import { useRef, useEffect, useState } from "react";
import { Emotion } from "@/types";
import { cn } from "@/lib/utils";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { EMOTION_ICONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  LucideAlertCircle, 
  LucideCamera, 
  LucideCameraOff, 
  LucideRefreshCw,
  LucideSmile 
} from "lucide-react";

interface CameraViewProps {
  isEnabled: boolean;
  onEmotionDetected?: (result: { emotion: Emotion; confidence: number }) => void;
  className?: string;
}

export function CameraView({
  isEnabled = true,
  onEmotionDetected,
  className
}: CameraViewProps) {
  const [showCamera, setShowCamera] = useState<boolean>(true);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  
  const {
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
  } = useFaceDetection({
    isEnabled: isEnabled && showCamera,
    detectInterval: 500, // Faster emotion detection for better responsiveness
    onEmotionDetected: (result) => {
      setFaceDetected(true);
      // Forward the emotion data to the parent component if needed
      if (onEmotionDetected) {
        onEmotionDetected(result);
      }
    }
  });

  // Effect to handle permission changes
  useEffect(() => {
    if (permission === false) {
      setShowCamera(false);
    }
  }, [permission]);

  // Toggle camera visibility
  const toggleCamera = () => {
    const newState = !showCamera;
    setShowCamera(newState);
    
    if (!newState && cameraActive) {
      stopCamera();
    } else if (newState && !cameraActive && isReady) {
      startCamera();
    }
  };

  // Retry camera initialization
  const retryCamera = () => {
    // Reset detection state
    setFaceDetected(false);
    
    // Stop current camera if active
    if (cameraActive) {
      stopCamera();
    }
    
    // Short delay to allow camera resources to be released
    setTimeout(() => {
      startCamera();
    }, 500);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0 relative">
        {/* Video display */}
        <div className="relative aspect-video bg-muted">
          {showCamera ? (
            <video
              ref={videoRef}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-200",
                isLoading || !cameraActive ? "opacity-70" : "opacity-100"
              )}
              autoPlay
              playsInline
              muted
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Camera is turned off</p>
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          )}

          {/* Models not loaded yet message */}
          {!isReady && !isLoading && showCamera && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
              <LucideSmile className="h-8 w-8 text-white mb-2" />
              <p className="text-white text-center px-4">Loading facial recognition models...</p>
            </div>
          )}

          {/* No face detected hint */}
          {isReady && cameraActive && !faceDetected && !currentEmotion && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-10">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 max-w-xs text-center">
                <LucideSmile className="h-6 w-6 text-white mx-auto mb-2" />
                <p className="text-white text-sm">
                  Position your face in the center of the camera
                </p>
              </div>
            </div>
          )}

          {/* Camera controls */}
          <div className="absolute bottom-2 right-2 flex gap-2 z-20">
            {/* Retry button when camera is active but no emotions are being detected */}
            {cameraActive && showCamera && isReady && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/40 hover:bg-black/60 backdrop-blur-sm"
                onClick={retryCamera}
                title="Retry camera detection"
              >
                <LucideRefreshCw size={16} className="mr-1" /> Reset
              </Button>
            )}
            
            {/* Camera toggle button */}
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-black/40 hover:bg-black/60 backdrop-blur-sm"
              onClick={toggleCamera}
            >
              {showCamera ? (
                <>
                  <LucideCameraOff size={16} className="mr-1" /> Hide
                </>
              ) : (
                <>
                  <LucideCamera size={16} className="mr-1" /> Show
                </>
              )}
            </Button>
          </div>

          {/* Emotion badge - only show when confidence is good */}
          {currentEmotion && emotionConfidence > 0.5 && showCamera && (
            <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-2 z-20 animate-fadeIn">
              <span className="text-lg">{EMOTION_ICONS[currentEmotion]}</span>
              <span className="font-medium capitalize">{currentEmotion}</span>
              <span className="text-xs opacity-70">{Math.round(emotionConfidence * 100)}%</span>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mt-2">
            <LucideAlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error} 
              {error.includes('camera') && (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-destructive underline ml-1"
                  onClick={retryCamera}
                >
                  Try again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}