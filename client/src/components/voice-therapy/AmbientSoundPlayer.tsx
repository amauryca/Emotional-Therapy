import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Music,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

// Define available ambient sounds
const AMBIENT_SOUNDS = [
  { id: "rainfall", name: "Gentle Rain", icon: "🌧️", src: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bda.mp3?filename=rain-ambient-114354.mp3" },
  { id: "waves", name: "Ocean Waves", icon: "🌊", src: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_fd98c296d8.mp3?filename=ocean-waves-112924.mp3" },
  { id: "birds", name: "Forest Birds", icon: "🐦", src: "https://cdn.pixabay.com/download/audio/2021/04/08/audio_c8812627da.mp3?filename=birds-singing-01-6771.mp3" },
  { id: "meditation", name: "Meditation", icon: "🧘", src: "https://cdn.pixabay.com/download/audio/2021/04/07/audio_fdafdde100.mp3?filename=meditation-112191.mp3" }
];

interface AmbientSoundPlayerProps {
  className?: string;
}

export default function AmbientSoundPlayer({ className }: AmbientSoundPlayerProps) {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Play/Pause function
  const togglePlayback = () => {
    if (!audioRef.current || !activeSound) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Try to play and handle any autoplay restrictions
      audioRef.current.play().catch(error => {
        console.error("Audio play failed:", error);
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  // Change sound function
  const changeSound = (soundId: string) => {
    const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
    if (!sound) return;
    
    const wasPlaying = isPlaying;
    
    // Pause current sound
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    // Set new sound
    setActiveSound(soundId);
    
    if (audioRef.current) {
      audioRef.current.src = sound.src;
      
      // If was playing before, resume playing
      if (wasPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Audio play failed:", error);
        });
        setIsPlaying(true);
      }
    }
  };

  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Get the active sound details
  const getActiveSoundDetails = () => {
    return AMBIENT_SOUNDS.find(s => s.id === activeSound) || AMBIENT_SOUNDS[0];
  };

  return (
    <div className={`relative ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        onClick={toggleExpanded}
      >
        <Music size={16} />
        <span className="ml-1">Ambient</span>
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-lg border border-blue-100 w-[250px] right-0"
          >
            <div className="text-sm font-medium mb-3 text-blue-800">Ambient Sounds</div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              {AMBIENT_SOUNDS.map((sound) => (
                <Button
                  key={sound.id}
                  variant={activeSound === sound.id ? "default" : "outline"}
                  size="sm"
                  className={`text-xs justify-start ${activeSound === sound.id ? 'bg-blue-500' : 'border-blue-200'}`}
                  onClick={() => changeSound(sound.id)}
                >
                  <span className="mr-1.5">{sound.icon}</span>
                  {sound.name}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!activeSound}
                onClick={togglePlayback}
                className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto"
              >
                {isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
              </Button>
              
              <div className="flex items-center gap-2 flex-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto"
                  onClick={() => setVolume(0)}
                >
                  <VolumeX size={16} />
                </Button>
                <Slider
                  value={[volume]}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                  onValueChange={(value) => setVolume(value[0])}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto"
                  onClick={() => setVolume(100)}
                >
                  <Volume2 size={16} />
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 italic">
              Ambient sounds can help create a calming atmosphere during your therapy session.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}