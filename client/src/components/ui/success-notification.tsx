import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Confetti } from '@/components/ui/confetti';

interface SuccessNotificationProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
  duration?: number;
  withConfetti?: boolean;
}

export function SuccessNotification({
  show,
  message,
  onComplete,
  duration = 3000,
  withConfetti = false
}: SuccessNotificationProps) {
  const [visible, setVisible] = useState(show);
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    if (show && !visible) {
      setVisible(true);
      if (withConfetti) {
        setConfettiActive(true);
      }
      
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) {
          setTimeout(onComplete, 300); // Give animation time to complete
        }
      }, duration);
      
      return () => clearTimeout(timer);
    }
    
    if (!show && visible) {
      setVisible(false);
    }
  }, [show, visible, duration, onComplete, withConfetti]);

  return (
    <>
      {withConfetti && <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />}
      
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-4 right-4 z-50 flex items-center bg-green-50 text-green-800 px-4 py-3 rounded-lg shadow-lg border border-green-200 max-w-sm"
          >
            <motion.div 
              initial={{ rotate: 0, scale: 0.8 }}
              animate={{ rotate: [0, 15, -15, 0], scale: [0.8, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="mr-3 text-green-500 flex-shrink-0"
            >
              <CheckCircle size={24} />
            </motion.div>
            <div>
              <div className="font-medium">Success!</div>
              <div className="text-sm text-green-600">{message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}