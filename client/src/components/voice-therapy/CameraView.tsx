import { useRef, useEffect, useState } from "react";
import { Emotion } from "@/types";
import { cn } from "@/lib/utils";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { EMOTION_ICONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LucideAlertCircle, LucideCamera, LucideCameraOff } from "lucide-react";

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
    onEmotionDetected
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

          {/* Camera controls */}
          <div className="absolute bottom-2 right-2 flex gap-2 z-20">
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

          {/* Emotion badge */}
          {currentEmotion && emotionConfidence > 0.5 && showCamera && (
            <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-2 z-20">
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
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}