import { useEffect, useState } from "react";
import { Emotion, EmotionDetection } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmotionVisualizer } from "./EmotionVisualizer";
import { getEmotionHistory } from "@/lib/faceApiLoader";
import { cn } from "@/lib/utils";

interface EmotionPanelProps {
  currentEmotion: Emotion | null;
  confidenceLevel: number;
  className?: string;
  compact?: boolean;
}

export function EmotionPanel({
  currentEmotion,
  confidenceLevel,
  className,
  compact = false
}: EmotionPanelProps) {
  const [emotionStats, setEmotionStats] = useState<Record<Emotion, number>>({
    neutral: 0,
    happy: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    fearful: 0,
    disgusted: 0,
    calm: 0,
    tense: 0
  });
  
  const [dominantEmotion, setDominantEmotion] = useState<Emotion | null>(null);
  
  // Update emotion stats based on emotion history
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const history = getEmotionHistory();
      
      if (history.length === 0) return;
      
      // Count occurrences and aggregate confidence
      const counts: Record<string, { count: number, totalConfidence: number }> = {};
      
      history.forEach(item => {
        if (!counts[item.emotion]) {
          counts[item.emotion] = { count: 0, totalConfidence: 0 };
        }
        counts[item.emotion].count++;
        counts[item.emotion].totalConfidence += item.confidence;
      });
      
      // Convert to percentages
      const total = history.length;
      const stats = { ...emotionStats };
      
      // Reset all emotions to 0
      Object.keys(stats).forEach(key => {
        stats[key as Emotion] = 0;
      });
      
      // Update with new values
      Object.entries(counts).forEach(([emotion, data]) => {
        const percentage = data.count / total;
        stats[emotion as Emotion] = percentage;
      });
      
      setEmotionStats(stats);
      
      // Find dominant emotion
      let maxCount = 0;
      let dominant: Emotion | null = null;
      
      Object.entries(counts).forEach(([emotion, data]) => {
        if (data.count > maxCount) {
          maxCount = data.count;
          dominant = emotion as Emotion;
        }
      });
      
      if (dominant) {
        setDominantEmotion(dominant);
      }
    }, 1000);
    
    return () => clearInterval(updateInterval);
  }, []);
  
  // Filter out emotions with 0% for display
  const emotionsToShow = Object.entries(emotionStats)
    .filter(([_, value]) => value > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, compact ? 3 : undefined)
    .map(([emotion, value]) => ({
      emotion: emotion as Emotion,
      percentage: value * 100
    }));
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn(
        "px-4 py-2", 
        compact ? "pb-0" : "pb-2"
      )}>
        <CardTitle className="text-base flex items-center justify-between">
          Emotion Detection
          {dominantEmotion && (
            <EmotionVisualizer 
              emotion={dominantEmotion} 
              confidence={0.9}
              size="sm" 
              showLabel={false} 
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(
        "px-4", 
        compact ? "pt-2 pb-3" : "py-4"
      )}>
        {currentEmotion ? (
          <>
            {!compact && (
              <div className="flex justify-center mb-4">
                <EmotionVisualizer 
                  emotion={currentEmotion} 
                  confidence={confidenceLevel} 
                />
              </div>
            )}
          
            <div className="space-y-2">
              {emotionsToShow.map(({ emotion, percentage }) => (
                <div key={emotion} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{emotion}</span>
                    <span>{Math.round(percentage)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
              
              {emotionsToShow.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-2">
                  No emotions detected yet
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground text-sm py-2">
            Enable camera to detect emotions
          </div>
        )}
      </CardContent>
    </Card>
  );
}