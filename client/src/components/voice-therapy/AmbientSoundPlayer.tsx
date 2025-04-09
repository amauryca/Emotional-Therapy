import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Music } from 'lucide-react';
import { AmbientPlayer } from '@/components/audio/AmbientPlayer';

interface AmbientSoundPlayerProps {
  className?: string;
}

export default function AmbientSoundPlayer({ className }: AmbientSoundPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`relative ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
        onClick={toggleExpanded}
      >
        <Music size={16} />
        <span className="ml-1">Ambient Sound</span>
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-lg border border-primary/20 w-[310px] right-0"
          >
            <div className="text-sm font-medium mb-3 text-primary">Ambient Sounds</div>
            
            {/* Use our new AmbientPlayer component */}
            <AmbientPlayer />
            
            <div className="text-xs text-muted-foreground mt-3 italic">
              Ambient sounds can help create a calming atmosphere during your therapy session.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}