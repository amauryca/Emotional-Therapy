import { useEffect, useRef, useState } from "react";
import { Emotion } from "@/types";
import { EMOTION_ICONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface EmotionVisualizerProps {
  emotion: Emotion | null;
  confidence: number;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmotionVisualizer({
  emotion,
  confidence,
  showLabel = true,
  className,
  size = "md"
}: EmotionVisualizerProps) {
  const [animActive, setAnimActive] = useState(false);
  const prevEmotionRef = useRef<Emotion | null>(null);
  
  // Trigger animation when emotion changes
  useEffect(() => {
    if (emotion && emotion !== prevEmotionRef.current) {
      setAnimActive(true);
      const timer = setTimeout(() => setAnimActive(false), 1000);
      prevEmotionRef.current = emotion;
      return () => clearTimeout(timer);
    }
  }, [emotion]);

  if (!emotion) return null;

  // Size classes
  const sizeClasses = {
    sm: "text-xl p-2",
    md: "text-3xl p-3",
    lg: "text-5xl p-4"
  };

  // Emotion-specific colors
  const getEmotionColor = (emotion: Emotion): string => {
    const colors: Record<Emotion, string> = {
      happy: "bg-gradient-to-r from-amber-300 to-yellow-500",
      sad: "bg-gradient-to-r from-blue-300 to-blue-500",
      angry: "bg-gradient-to-r from-red-400 to-red-600",
      neutral: "bg-gradient-to-r from-gray-300 to-gray-500",
      surprised: "bg-gradient-to-r from-purple-300 to-purple-500",
      fearful: "bg-gradient-to-r from-indigo-300 to-indigo-500",
      disgusted: "bg-gradient-to-r from-green-300 to-green-500",
      calm: "bg-gradient-to-r from-teal-300 to-teal-500",
      tense: "bg-gradient-to-r from-orange-300 to-orange-500"
    };
    
    return colors[emotion] || colors.neutral;
  };
  
  // Get animation based on emotion type
  const getEmotionAnimation = (emotion: Emotion): string => {
    const animations: Partial<Record<Emotion, string>> = {
      happy: "animate-bounceIn",
      surprised: "animate-bounceIn",
      angry: "animate-pulse",
      fearful: "animate-breathe",
      calm: "animate-breathe"
    };
    
    return animations[emotion] || "animate-fadeIn";
  };

  const emotionColor = getEmotionColor(emotion);
  const emotionAnimation = getEmotionAnimation(emotion);
  
  return (
    <div className={cn(
      "flex flex-col items-center",
      className
    )}>
      <div 
        className={cn(
          "rounded-full flex items-center justify-center transition-all",
          emotionColor,
          sizeClasses[size],
          animActive ? "scale-125" : "scale-100",
          animActive ? emotionAnimation : ""
        )}
        style={{ 
          opacity: Math.max(0.5, confidence),
          boxShadow: `0 0 ${Math.round(confidence * 20)}px rgba(0,0,0,0.2)`
        }}
      >
        <span className="drop-shadow-sm">{EMOTION_ICONS[emotion]}</span>
      </div>
      
      {showLabel && (
        <span className={cn(
          "mt-2 font-medium capitalize text-center transition-opacity duration-300",
          size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base",
          animActive ? "animate-fadeIn" : ""
        )}>
          {emotion}
          {confidence > 0 && (
            <span className="ml-1 opacity-70 text-xs">
              {Math.round(confidence * 100)}%
            </span>
          )}
        </span>
      )}
    </div>
  );
}