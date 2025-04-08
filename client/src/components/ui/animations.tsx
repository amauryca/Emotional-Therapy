import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Therapeutic colors
export const THERAPEUTIC_COLORS = {
  // Calming blues
  calm: ['#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1', '#26c6da'],
  // Cheerful greens
  happy: ['#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a'],
  // Gentle purples
  peaceful: ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc'],
  // Warm yellows
  positive: ['#fffde7', '#fff9c4', '#fff59d', '#fff176', '#ffee58'],
  // Soft reds
  energetic: ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350']
};

type TherapeuticMood = 'calm' | 'happy' | 'peaceful' | 'positive' | 'energetic';

interface TherapeuticGradientProps {
  children: React.ReactNode;
  mood?: TherapeuticMood;
  className?: string;
}

/**
 * Background gradient with therapeutic colors
 */
export const TherapeuticBackground: React.FC<TherapeuticGradientProps> = ({ 
  children, 
  mood = 'calm',
  className = ''
}) => {
  const colorSet = THERAPEUTIC_COLORS[mood];
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundImage: `linear-gradient(45deg, ${colorSet[0]} 0%, ${colorSet[2]} 50%, ${colorSet[4]} 100%)`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Animated transition component with a therapeutic mood
 */
export const TherapeuticTransition: React.FC<{
  children: React.ReactNode;
  mood?: TherapeuticMood;
  className?: string;
}> = ({ children, mood = 'calm', className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className={className}
      style={{
        backgroundImage: `linear-gradient(135deg, ${THERAPEUTIC_COLORS[mood][0]} 0%, ${THERAPEUTIC_COLORS[mood][2]} 100%)`,
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Floating bubbles animation component with a therapeutic theme
 */
export const TherapeuticBubbles: React.FC<{
  count?: number;
  mood?: TherapeuticMood;
  size?: 'small' | 'medium' | 'large';
}> = ({ 
  count = 20, 
  mood = 'calm',
  size = 'medium'
}) => {
  const colorSet = THERAPEUTIC_COLORS[mood];
  const bubbles = Array.from({ length: count }, (_, i) => i);
  
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'max-w-[30px] max-h-[30px]';
      case 'large': return 'max-w-[100px] max-h-[100px]';
      default: return 'max-w-[60px] max-h-[60px]';
    }
  };
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((i) => {
        // Random attributes for each bubble
        const left = `${Math.random() * 100}%`;
        const size = 10 + Math.random() * 50;
        const color = colorSet[Math.floor(Math.random() * colorSet.length)];
        const animationDuration = 20 + Math.random() * 30;
        const delay = Math.random() * 10;
        
        return (
          <motion.div
            key={i}
            className={`absolute rounded-full opacity-40 ${getSizeClass()}`}
            style={{
              left,
              width: size,
              height: size,
              backgroundColor: color,
              bottom: '-10%',
            }}
            animate={{
              y: [0, -window.innerHeight * 1.1]
            }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              delay,
              ease: 'linear'
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Pulsing circle animation for drawing attention
 */
export const TherapeuticPulse: React.FC<{
  color?: string;
  size?: number;
  duration?: number;
  className?: string;
  children?: React.ReactNode;
}> = ({ 
  color = THERAPEUTIC_COLORS.calm[3], 
  size = 50,
  duration = 2,
  className = '',
  children
}) => {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute rounded-full"
        style={{
          backgroundColor: color,
          width: size,
          height: size,
          top: '50%',
          left: '50%',
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 0.2, 0.7]
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <div 
        className="relative rounded-full flex items-center justify-center"
        style={{
          backgroundColor: color,
          width: size,
          height: size,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Gently waving animation component
 */
export const TherapeuticWave: React.FC<{
  children: React.ReactNode;
  amplitude?: number;
  speed?: number;
  className?: string;
}> = ({
  children,
  amplitude = 5,
  speed = 3,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-amplitude, amplitude, -amplitude]
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Button with a calming ripple effect on click
 */
export const TherapeuticButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  mood?: TherapeuticMood;
}> = ({
  children,
  onClick,
  className = '',
  mood = 'calm'
}) => {
  const [isRippling, setIsRippling] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const colorSet = THERAPEUTIC_COLORS[mood];
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    
    setRipplePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setIsRippling(true);
    
    // Execute onClick handler
    if (onClick) onClick();
    
    // Reset ripple after animation
    setTimeout(() => setIsRippling(false), 600);
  };
  
  return (
    <button
      onClick={handleClick}
      className={`relative overflow-hidden transition-all ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${colorSet[1]} 0%, ${colorSet[3]} 100%)`,
      }}
    >
      {children}
      
      <AnimatePresence>
        {isRippling && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute rounded-full bg-white"
            style={{
              top: ripplePosition.y,
              left: ripplePosition.x,
              width: 10,
              height: 10,
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </AnimatePresence>
    </button>
  );
};