import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Heart, Smile, Sun, Shield, Sparkles, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface Tip {
  id: number;
  title: string;
  content: string;
  icon: React.ReactNode;
  color: string;
}

const TIPS: Tip[] = [
  {
    id: 1,
    title: "Practice Mindfulness",
    content: "Take 5 minutes to focus on your breath. Notice thoughts without judgment, then gently return attention to breathing.",
    icon: <Brain className="h-5 w-5" />,
    color: "bg-blue-50 border-blue-200 text-blue-700"
  },
  {
    id: 2,
    title: "Express Gratitude",
    content: "Write down three things you're grateful for today, no matter how small. This shifts focus to positive aspects of life.",
    icon: <Heart className="h-5 w-5" />,
    color: "bg-red-50 border-red-200 text-red-700"
  },
  {
    id: 3,
    title: "Move Your Body",
    content: "Even 10 minutes of physical activity releases endorphins that improve mood and reduce stress hormones.",
    icon: <Smile className="h-5 w-5" />,
    color: "bg-green-50 border-green-200 text-green-700"
  },
  {
    id: 4,
    title: "Connect with Others",
    content: "Reach out to someone you care about today. Social connections are crucial for mental wellbeing.",
    icon: <Sun className="h-5 w-5" />,
    color: "bg-yellow-50 border-yellow-200 text-yellow-700"
  },
  {
    id: 5,
    title: "Set Boundaries",
    content: "Practice saying 'no' to requests that drain your energy. Healthy boundaries protect your mental health.",
    icon: <Shield className="h-5 w-5" />,
    color: "bg-purple-50 border-purple-200 text-purple-700"
  },
  {
    id: 6,
    title: "Practice Self-Compassion",
    content: "Speak to yourself as you would to a good friend. Replace self-criticism with kindness and understanding.",
    icon: <Sparkles className="h-5 w-5" />,
    color: "bg-teal-50 border-teal-200 text-teal-700"
  },
  {
    id: 7,
    title: "Limit Media Consumption",
    content: "Set boundaries around news and social media. Choose specific times to check updates rather than constant scrolling.",
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-indigo-50 border-indigo-200 text-indigo-700"
  }
];

export default function MentalHealthTips() {
  const [currentTip, setCurrentTip] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const isMobile = useIsMobile();
  
  // Function to go to the next tip
  const nextTip = useCallback(() => {
    setDirection(1);
    setCurrentTip((prev) => (prev + 1) % TIPS.length);
  }, []);
  
  // Function to go to the previous tip
  const prevTip = useCallback(() => {
    setDirection(-1);
    setCurrentTip((prev) => (prev - 1 + TIPS.length) % TIPS.length);
  }, []);
  
  // Auto-advance the carousel every 8 seconds if auto-play is enabled
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoPlaying) {
      interval = setInterval(nextTip, 8000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, nextTip]);
  
  // Pause auto-play when user interacts with the carousel
  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    // Resume auto-play after 30 seconds of inactivity
    const timeout = setTimeout(() => setIsAutoPlaying(true), 30000);
    return () => clearTimeout(timeout);
  };
  
  // Handle touch events for swiping on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    // If the user swiped more than 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextTip();
      } else {
        prevTip();
      }
      pauseAutoPlay();
    }
  };
  
  // Variants for the animation
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div 
      className="relative w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base md:text-lg font-medium">Daily Mental Health Tips</h3>
        <div className="flex space-x-1">
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 w-7 p-0" 
            onClick={() => {
              prevTip();
              pauseAutoPlay();
            }}
            aria-label="Previous tip"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={() => {
              nextTip();
              pauseAutoPlay();
            }}
            aria-label="Next tip"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Carousel */}
      <div className="relative overflow-hidden rounded-lg bg-white">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentTip}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="w-full"
          >
            <Card className={`border-2 p-3 md:p-4 min-h-[150px] ${TIPS[currentTip].color}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-full bg-white/50 p-1.5">
                  {TIPS[currentTip].icon}
                </div>
                <h4 className="font-medium text-sm md:text-base">{TIPS[currentTip].title}</h4>
              </div>
              <p className="text-sm md:text-base">{TIPS[currentTip].content}</p>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Progress indicators */}
      <div className="flex justify-center mt-3 space-x-1">
        {TIPS.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === currentTip 
                ? "w-4 bg-primary" 
                : "w-1.5 bg-secondary/30"
            }`}
            onClick={() => {
              setDirection(index > currentTip ? 1 : -1);
              setCurrentTip(index);
              pauseAutoPlay();
            }}
            aria-label={`Go to tip ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}