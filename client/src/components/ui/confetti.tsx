import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
  duration?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  opacity: number;
  rotation: number;
}

const COLORS = ['#FF5252', '#3D5AFE', '#00BFA5', '#FFD740', '#FF4081', '#64FFDA', '#536DFE', '#FFAB40'];

export function Confetti({ active, onComplete, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  // Generate confetti particles
  useEffect(() => {
    if (active && !isActive) {
      setIsActive(true);
      
      // Create particles
      const newParticles: Particle[] = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: -20 - Math.random() * 40,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 5 + Math.random() * 10,
          opacity: 0.6 + Math.random() * 0.4,
          rotation: Math.random() * 360,
        });
      }
      setParticles(newParticles);
      
      // Schedule end of animation
      const timer = setTimeout(() => {
        setParticles([]);
        setIsActive(false);
        if (onComplete) onComplete();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [active, isActive, onComplete, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: `${particle.x}vw`, 
              y: `${particle.y}vh`, 
              opacity: particle.opacity,
              rotate: particle.rotation,
              scale: 0
            }}
            animate={{ 
              y: `${70 + Math.random() * 20}vh`, 
              x: `${particle.x + (Math.random() * 20 - 10)}vw`,
              rotate: particle.rotation + 360 + Math.random() * 180,
              scale: 1
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 1.5 + Math.random() * 1.5,
              ease: "easeOut",
              delay: Math.random() * 0.2
            }}
            style={{ 
              position: 'absolute',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              borderRadius: `${Math.random() > 0.5 ? '50%' : '0%'}`
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}