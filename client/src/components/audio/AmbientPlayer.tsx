import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Volume2, 
  VolumeX, 
  PlayCircle, 
  PauseCircle, 
  Waves, 
  Trees,
  Cloud,
  Music
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// Sound types available in the player
type SoundType = 'rain' | 'ocean' | 'forest' | 'meditation';

// Sound configuration data
const soundLabels: Record<SoundType, { name: string, icon: React.ReactNode }> = {
  rain: { name: 'Rain Sounds', icon: <Cloud className="h-4 w-4" /> },
  ocean: { name: 'Ocean Waves', icon: <Waves className="h-4 w-4" /> },
  forest: { name: 'Forest Ambience', icon: <Trees className="h-4 w-4" /> },
  meditation: { name: 'Meditation Music', icon: <Music className="h-4 w-4" /> }
};

interface AmbientPlayerProps {
  className?: string;
  isCompact?: boolean;
}

export function AmbientPlayer({ className, isCompact = false }: AmbientPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentSound, setCurrentSound] = useState<SoundType>('rain');
  const audioContext = useRef<AudioContext | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const soundNodes = useRef<Record<string, OscillatorNode | AudioBufferSourceNode | null>>({});
  
  // Initialize audio context
  useEffect(() => {
    // Create audio context when needed
    if (isPlaying && !audioContext.current) {
      try {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = volume;
        gainNode.current.connect(audioContext.current.destination);
      } catch (error) {
        console.error('WebAudio API not supported:', error);
      }
    }
    
    return () => {
      // Cleanup on component unmount
      if (audioContext.current) {
        stopAllSounds();
        audioContext.current.close();
      }
    };
  }, [isPlaying]);
  
  // Update volume when changed
  useEffect(() => {
    if (gainNode.current) {
      gainNode.current.gain.value = volume;
    }
  }, [volume]);
  
  // Play or stop sounds based on isPlaying state
  useEffect(() => {
    if (isPlaying) {
      playSound(currentSound);
    } else {
      stopAllSounds();
    }
  }, [isPlaying, currentSound]);
  
  // Generate and play a sound
  const playSound = (type: SoundType) => {
    if (!audioContext.current || !gainNode.current) return;
    
    // Stop any currently playing sounds
    stopAllSounds();
    
    // Create appropriate sound based on type
    switch (type) {
      case 'rain':
        generateRainSound();
        break;
      case 'ocean':
        generateOceanWaves();
        break;
      case 'forest':
        generateForestSounds();
        break;
      case 'meditation':
        generateMeditationMusic();
        break;
    }
  };
  
  // Stop all playing sounds
  const stopAllSounds = () => {
    Object.keys(soundNodes.current).forEach(key => {
      if (soundNodes.current[key]) {
        try {
          soundNodes.current[key]?.stop();
        } catch (e) {
          // Ignore if already stopped
        }
        soundNodes.current[key] = null;
      }
    });
  };
  
  // Rain sound generator
  const generateRainSound = () => {
    if (!audioContext.current || !gainNode.current) return;
    
    const ctx = audioContext.current;
    
    // Create multiple noise sources for rain effect
    for (let i = 0; i < 5; i++) {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      // Create different densities of noise for rain effect
      for (let j = 0; j < bufferSize; j++) {
        // Different rain drop density based on index
        output[j] = Math.random() * (i < 3 ? 0.15 : 0.05) * (1 - (i * 0.15));
      }
      
      // Set up filter for each rain layer
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 400 + (i * 500);
      
      // Connect nodes
      source.connect(filter);
      filter.connect(gainNode.current);
      
      // Start with slight delay between layers
      source.start(ctx.currentTime + (i * 0.1));
      
      // Store for later cleanup
      soundNodes.current[`rain_${i}`] = source;
    }
  };
  
  // Ocean waves sound generator
  const generateOceanWaves = () => {
    if (!audioContext.current || !gainNode.current) return;
    
    const ctx = audioContext.current;
    
    // Low frequency oscillator for wave base
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Slow waves
    
    // White noise for wave crashes
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 0.25;
    }
    
    // Create noise source
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    // Filter the noise to create wave sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 10;
    
    // Use LFO to modulate filter for wave effect
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 800;
    
    // Connect everything
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    noiseSource.connect(filter);
    filter.connect(gainNode.current);
    
    // Start both sources
    lfo.start();
    noiseSource.start();
    
    // Store for cleanup
    soundNodes.current['ocean_lfo'] = lfo;
    soundNodes.current['ocean_noise'] = noiseSource;
  };
  
  // Forest sounds generator
  const generateForestSounds = () => {
    if (!audioContext.current || !gainNode.current) return;
    
    const ctx = audioContext.current;
    
    // Create occasional bird chirps
    const chirpScheduler = setInterval(() => {
      if (!audioContext.current || !gainNode.current) {
        clearInterval(chirpScheduler);
        return;
      }
      
      // Only play chirps sometimes
      if (Math.random() > 0.4) {
        // Bird chirp oscillator
        const chirp = ctx.createOscillator();
        chirp.type = 'sine';
        
        // Random bird pitch
        const birdFreq = 1000 + Math.random() * 1000;
        chirp.frequency.setValueAtTime(birdFreq, ctx.currentTime);
        chirp.frequency.exponentialRampToValueAtTime(
          birdFreq + 500, 
          ctx.currentTime + 0.1
        );
        
        // Chirp envelope
        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0, ctx.currentTime);
        chirpGain.gain.linearRampToValueAtTime(0.3 * volume, ctx.currentTime + 0.05);
        chirpGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        
        // Connect and play chirp
        chirp.connect(chirpGain);
        chirpGain.connect(ctx.destination);
        
        chirp.start();
        chirp.stop(ctx.currentTime + 0.2);
      }
    }, 2000);
    
    // Wind/leaves background noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 0.07;
    }
    
    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;
    
    // Filter the noise to sound like wind in leaves
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 600;
    windFilter.Q.value = 0.5;
    
    // Connect and play wind
    windSource.connect(windFilter);
    windFilter.connect(gainNode.current);
    windSource.start();
    
    // Store for cleanup
    soundNodes.current['forest_wind'] = windSource;
    
    // Store interval ID for cleanup
    (soundNodes.current as any)['forest_interval'] = chirpScheduler;
  };
  
  // Meditation music generator
  const generateMeditationMusic = () => {
    if (!audioContext.current || !gainNode.current) return;
    
    const ctx = audioContext.current;
    
    // Create drone base
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 60; // Low C
    
    // Create fifth harmony
    const fifth = ctx.createOscillator();
    fifth.type = 'sine';
    fifth.frequency.value = 90; // Fifth above
    
    // Create octave
    const octave = ctx.createOscillator();
    octave.type = 'sine';
    octave.frequency.value = 120; // Octave above
    
    // Gain nodes for each oscillator
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.2;
    
    const fifthGain = ctx.createGain();
    fifthGain.gain.value = 0.1;
    
    const octaveGain = ctx.createGain();
    octaveGain.gain.value = 0.05;
    
    // Connect everything
    drone.connect(droneGain);
    fifth.connect(fifthGain);
    octave.connect(octaveGain);
    
    droneGain.connect(gainNode.current);
    fifthGain.connect(gainNode.current);
    octaveGain.connect(gainNode.current);
    
    // Start all oscillators
    drone.start();
    fifth.start();
    octave.start();
    
    // Store for cleanup
    soundNodes.current['meditation_drone'] = drone;
    soundNodes.current['meditation_fifth'] = fifth;
    soundNodes.current['meditation_octave'] = octave;
    
    // Set up a simple arpeggio pattern that repeats
    const notes = [261.63, 293.66, 329.63, 392.0, 523.25]; // C, D, E, G, C
    let noteIndex = 0;
    
    const arpeggioScheduler = setInterval(() => {
      if (!audioContext.current || !gainNode.current) {
        clearInterval(arpeggioScheduler);
        return;
      }
      
      // Create a note
      const note = ctx.createOscillator();
      note.type = 'sine';
      note.frequency.value = notes[noteIndex];
      
      // Note envelope
      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.08 * volume, ctx.currentTime + 0.1);
      noteGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
      
      // Connect and play note
      note.connect(noteGain);
      noteGain.connect(ctx.destination);
      
      note.start();
      note.stop(ctx.currentTime + 1.0);
      
      // Move to next note
      noteIndex = (noteIndex + 1) % notes.length;
    }, 2000);
    
    // Store interval ID for cleanup
    (soundNodes.current as any)['meditation_interval'] = arpeggioScheduler;
  };
  
  // Handle play/pause toggle
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Handle sound selection
  const selectSound = (sound: SoundType) => {
    setCurrentSound(sound);
    if (isPlaying) {
      playSound(sound);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
  };
  
  // Clean up intervals when component unmounts
  useEffect(() => {
    return () => {
      // Clear any intervals
      if ((soundNodes.current as any)['forest_interval']) {
        clearInterval((soundNodes.current as any)['forest_interval']);
      }
      if ((soundNodes.current as any)['meditation_interval']) {
        clearInterval((soundNodes.current as any)['meditation_interval']);
      }
    };
  }, []);
  
  if (isCompact) {
    // Compact version for embedding in other components
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={cn("flex items-center gap-1", className, 
              isPlaying ? "border-blue-300 text-blue-800 bg-blue-50" : ""
            )}
          >
            {isPlaying ? (
              <>
                <Volume2 className="h-4 w-4" /> 
                <span className="hidden sm:inline-block">Ambient</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span className="hidden sm:inline-block">Ambient</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Ambient Sounds</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem 
              className="justify-between cursor-pointer"
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <>
                  Pause <PauseCircle className="h-4 w-4" />
                </>
              ) : (
                <>
                  Play <PlayCircle className="h-4 w-4" />
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Sound Type</DropdownMenuLabel>
          
          <DropdownMenuGroup>
            {Object.entries(soundLabels).map(([key, { name, icon }]) => (
              <DropdownMenuItem 
                key={key}
                className={cn(
                  "cursor-pointer", 
                  currentSound === key && "bg-blue-50 text-blue-700"
                )}
                onClick={() => selectSound(key as SoundType)}
              >
                <span className="flex items-center gap-2">
                  {icon}
                  {name}
                </span>
                {currentSound === key && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <div className="px-2 py-2">
            <div className="flex items-center mb-1">
              <Volume2 className="h-3 w-3 mr-1" />
              <span className="text-xs">Volume</span>
            </div>
            <Slider
              defaultValue={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  // Full version
  return (
    <div className={cn("rounded-lg border p-4 shadow-sm", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Ambient Sounds</h3>
        <Button 
          onClick={togglePlayback}
          variant={isPlaying ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          {isPlaying ? (
            <>
              <PauseCircle className="h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" /> Play
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Object.entries(soundLabels).map(([key, { name, icon }]) => (
          <Button
            key={key}
            variant={currentSound === key ? "secondary" : "outline"}
            size="sm"
            className="justify-start gap-2"
            onClick={() => selectSound(key as SoundType)}
          >
            {icon}
            <span>{name}</span>
          </Button>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4" />
        <Slider
          defaultValue={[volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="flex-1"
        />
      </div>
    </div>
  );
}