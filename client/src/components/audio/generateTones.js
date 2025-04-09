// This is a utility script to generate ambient sounds
// Generate 30-second audio files and then convert to base64 for direct embedding

const NOTE_FREQUENCIES = {
  // C major scale frequencies in Hz
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
};

// Function to generate a tone at the given frequency
function generateTone(context, frequency, startTime, duration, volume = 0.2) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  oscillator.type = 'sine'; // sine, square, triangle, sawtooth
  oscillator.frequency.value = frequency;
  
  // Apply volume and envelope
  gainNode.gain.value = 0;
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.1);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
  
  return { oscillator, gainNode };
}

// Generate a rain ambient sound (gentle white noise with water drips)
function generateRainSound(context, duration = 30) {
  const mainGainNode = context.createGain();
  mainGainNode.gain.value = 0.2;
  mainGainNode.connect(context.destination);
  
  // Background white noise for rain
  const bufferSize = 2 * context.sampleRate;
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const whiteNoise = context.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;
  
  // Apply filter to make it more like rain
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;
  
  whiteNoise.connect(filter);
  filter.connect(mainGainNode);
  whiteNoise.start(0);
  whiteNoise.stop(duration);
  
  // Add occasional water drops
  for (let i = 0; i < duration * 2; i++) {
    const time = Math.random() * duration;
    const freq = 500 + Math.random() * 2000;
    const dropLength = 0.05 + Math.random() * 0.1;
    
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.frequency.value = freq;
    oscillator.type = "sine";
    
    gainNode.gain.value = 0;
    gainNode.gain.linearRampToValueAtTime(0.1 + Math.random() * 0.1, time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + dropLength);
    
    oscillator.connect(gainNode);
    gainNode.connect(mainGainNode);
    
    oscillator.start(time);
    oscillator.stop(time + dropLength);
  }
  
  return mainGainNode;
}

// Generate ocean wave sounds
function generateOceanWaves(context, duration = 30) {
  const mainGainNode = context.createGain();
  mainGainNode.gain.value = 0.3;
  mainGainNode.connect(context.destination);
  
  // Create filtered noise for the waves
  const bufferSize = 2 * context.sampleRate;
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  
  // Apply filter to make it more like ocean
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 280;
  
  noise.connect(filter);
  
  // Create wave patterns with automated gain
  const waveGain = context.createGain();
  waveGain.gain.value = 0.1;
  
  // Create wave patterns
  for (let i = 0; i < duration / 4; i++) {
    const time = i * 4;
    waveGain.gain.linearRampToValueAtTime(0.05, time);
    waveGain.gain.linearRampToValueAtTime(0.3, time + 2);
    waveGain.gain.linearRampToValueAtTime(0.05, time + 4);
  }
  
  filter.connect(waveGain);
  waveGain.connect(mainGainNode);
  
  noise.start(0);
  noise.stop(duration);
  
  return mainGainNode;
}

// Generate forest sounds with bird chirps
function generateForestSounds(context, duration = 30) {
  const mainGainNode = context.createGain();
  mainGainNode.gain.value = 0.25;
  mainGainNode.connect(context.destination);
  
  // Light background noise for forest ambience
  const bufferSize = 2 * context.sampleRate;
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 0.2 - 0.1; // Quieter noise
  }
  
  const whiteNoise = context.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;
  
  // Apply filter for background rustling leaves
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2000;
  filter.Q.value = 0.5;
  
  whiteNoise.connect(filter);
  filter.connect(mainGainNode);
  whiteNoise.start(0);
  whiteNoise.stop(duration);
  
  // Add bird chirps
  for (let i = 0; i < duration / 3; i++) {
    const startTime = Math.random() * duration;
    
    // Create a series of chirps
    const numChirps = 1 + Math.floor(Math.random() * 5);
    const birdType = Math.random() > 0.5 ? 'high' : 'mid';
    const baseFreq = birdType === 'high' ? 2500 + Math.random() * 1500 : 1200 + Math.random() * 800;
    
    for (let j = 0; j < numChirps; j++) {
      const chirpTime = startTime + j * (0.1 + Math.random() * 0.2);
      const chirpLength = 0.05 + Math.random() * 0.1;
      const freq = baseFreq + (Math.random() * 300 - 150);
      
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.frequency.value = freq;
      oscillator.type = "sine";
      
      gainNode.gain.value = 0;
      gainNode.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.15, chirpTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, chirpTime + chirpLength);
      
      oscillator.connect(gainNode);
      gainNode.connect(mainGainNode);
      
      oscillator.start(chirpTime);
      oscillator.stop(chirpTime + chirpLength);
    }
  }
  
  return mainGainNode;
}

// Generate meditation music with gentle tones
function generateMeditationMusic(context, duration = 30) {
  const mainGainNode = context.createGain();
  mainGainNode.gain.value = 0.3;
  mainGainNode.connect(context.destination);
  
  // Create a reverb effect
  const convolver = context.createConvolver();
  const reverbTime = 3;
  const rate = context.sampleRate;
  const reverbLength = rate * reverbTime;
  const impulse = context.createBuffer(2, reverbLength, rate);
  
  for (let channel = 0; channel < 2; channel++) {
    const impulseData = impulse.getChannelData(channel);
    for (let i = 0; i < reverbLength; i++) {
      impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 2);
    }
  }
  
  convolver.buffer = impulse;
  
  // Notes for meditation (pentatonic scale)
  const notes = [
    NOTE_FREQUENCIES.C4, 
    NOTE_FREQUENCIES.D4, 
    NOTE_FREQUENCIES.E4, 
    NOTE_FREQUENCIES.G4, 
    NOTE_FREQUENCIES.A4,
    NOTE_FREQUENCIES.C5
  ];
  
  // Create gentle bell-like tones
  for (let i = 0; i < duration / 2; i++) {
    const time = i * 2 + Math.random() * 0.5;
    const note = notes[Math.floor(Math.random() * notes.length)];
    const noteLength = 1.5 + Math.random();
    
    // Main note
    const osc = context.createOscillator();
    const gainNode = context.createGain();
    
    osc.frequency.value = note;
    osc.type = "sine";
    
    gainNode.gain.value = 0;
    gainNode.gain.linearRampToValueAtTime(0.2, time + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + noteLength);
    
    osc.connect(gainNode);
    gainNode.connect(convolver);
    gainNode.connect(mainGainNode); // Direct sound
    
    osc.start(time);
    osc.stop(time + noteLength);
    
    // Harmonic
    if (Math.random() > 0.5) {
      const harmonic = context.createOscillator();
      const harmonicGain = context.createGain();
      
      harmonic.frequency.value = note * 1.5; // Fifth above
      harmonic.type = "sine";
      
      harmonicGain.gain.value = 0;
      harmonicGain.gain.linearRampToValueAtTime(0.06, time + 0.1);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, time + noteLength * 0.8);
      
      harmonic.connect(harmonicGain);
      harmonicGain.connect(convolver);
      
      harmonic.start(time + 0.1);
      harmonic.stop(time + noteLength * 0.8);
    }
  }
  
  // Connect reverb
  convolver.connect(mainGainNode);
  
  return mainGainNode;
}

// Function to generate all ambient sounds
function generateAllSounds() {
  // This would be used in a Node.js environment with Web Audio API
  // Since we're in a browser environment, we'll generate them directly
  console.log("Generate sounds functionality works in Node.js environment with AudioContext");
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateRainSound,
    generateOceanWaves,
    generateForestSounds,
    generateMeditationMusic,
    generateAllSounds,
  };
}