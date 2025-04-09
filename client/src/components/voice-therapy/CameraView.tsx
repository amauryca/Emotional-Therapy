import { useRef, useEffect, useState } from "react";
import { Emotion } from "@/types";
import { cn } from "@/lib/utils";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { EMOTION_ICONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Camera, 
  CameraOff, 
  RefreshCw,
  Smile,
  Maximize2,
  Minimize2 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [expanded, setExpanded] = useState<boolean>(false);
  const isMobile = useIsMobile();
  
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

  // Toggle expanded/fullscreen view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        expanded ? "fixed inset-4 z-50 md:inset-8 lg:inset-16" : "",
        className
      )}
    >
      <CardHeader className={cn(
        "flex-row items-center justify-between p-2 md:p-3",
        expanded ? "bg-purple-50" : ""
      )}>
        <CardTitle className="text-sm md:text-base flex items-center gap-2">
          <Camera className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
          <span className="text-purple-800">Emotion Detection</span>
          {currentEmotion && (
            <Badge variant="outline" className="ml-1 md:ml-2 bg-purple-100 border-purple-200">
              <span className="text-lg mr-1">{EMOTION_ICONS[currentEmotion]}</span>
              <span className="text-xs md:text-sm capitalize">{currentEmotion}</span>
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="h-7 w-7 md:h-8 md:w-8 p-0 rounded-full"
          >
            {expanded ? (
              <Minimize2 className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        "p-0 relative",
        expanded ? "h-[calc(100%-56px)]" : ""
      )}>
        {/* Video display with improved aspect ratio for mobile */}
        <div className={cn(
          "relative bg-muted",
          expanded ? "h-full" : "aspect-[4/3] md:aspect-video" // Taller ratio on mobile for better face framing
        )}>
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
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
          )}

          {/* Models not loaded yet message */}
          {!isReady && !isLoading && showCamera && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
              <Smile className="h-8 w-8 text-white mb-2" />
              <p className="text-white text-center px-4">Loading facial recognition models...</p>
            </div>
          )}

          {/* No face detected hint */}
          {isReady && cameraActive && !faceDetected && !currentEmotion && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-10">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 max-w-xs text-center">
                <Smile className="h-6 w-6 text-white mx-auto mb-2" />
                <p className="text-white text-sm">
                  Position your face in the center of the camera
                </p>
              </div>
            </div>
          )}

          {/* Camera controls - improved positioning for mobile */}
          <div className={cn(
            "absolute bottom-2 flex gap-2 z-20",
            isMobile ? "left-1/2 transform -translate-x-1/2" : "right-2"
          )}>
            {/* Retry button when camera is active but no emotions are being detected */}
            {cameraActive && showCamera && isReady && (
              <Button
                variant="secondary"
                size={isMobile ? "sm" : "default"}
                className="bg-purple-500/70 hover:bg-purple-600/80 text-white backdrop-blur-sm"
                onClick={retryCamera}
                title="Retry camera detection"
              >
                <RefreshCw size={isMobile ? 16 : 18} className={isMobile ? "mr-1" : "mr-2"} /> Reset
              </Button>
            )}
            
            {/* Camera toggle button */}
            <Button 
              variant="secondary" 
              size={isMobile ? "sm" : "default"}
              className="bg-purple-500/70 hover:bg-purple-600/80 text-white backdrop-blur-sm"
              onClick={toggleCamera}
            >
              {showCamera ? (
                <>
                  <CameraOff size={isMobile ? 16 : 18} className={isMobile ? "mr-1" : "mr-2"} /> Hide
                </>
              ) : (
                <>
                  <Camera size={isMobile ? 16 : 18} className={isMobile ? "mr-1" : "mr-2"} /> Show
                </>
              )}
            </Button>
          </div>

          {/* Enhanced emotion badge with larger font and better visibility */}
          {currentEmotion && emotionConfidence > 0.5 && showCamera && (
            <div className={cn(
              "absolute bg-purple-600/80 backdrop-blur-sm text-white px-3 py-2 rounded-md flex items-center gap-2 z-20 animate-fadeIn",
              isMobile ? "top-2 left-2 right-2 justify-center" : "top-3 left-3"
            )}>
              <span className={cn("text-2xl", isMobile ? "" : "mr-1")}>{EMOTION_ICONS[currentEmotion]}</span>
              <span className={cn("font-medium capitalize", isMobile ? "text-base" : "text-lg")}>{currentEmotion}</span>
              <span className={cn("opacity-80", isMobile ? "text-xs" : "text-sm")}>
                {Math.round(emotionConfidence * 100)}% confidence
              </span>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mt-2 mx-2">
            <AlertCircle className="h-4 w-4" />
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