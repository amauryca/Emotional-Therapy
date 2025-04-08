import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Brain, Heart, ShieldPlus, SmilePlus, Frown, Zap, Lightbulb, List, CheckCheck, Sparkles, Clock, Bookmark, BarChart } from 'lucide-react';
import { getEmotionHistory } from '@/lib/faceApiLoader';
import { getVocalToneHistory } from '@/lib/ai';
import { Emotion, VocalTone } from '@/types';
import { EMOTION_ICONS } from '@/lib/constants';

// Create types for module content
interface ModuleContent {
  title: string;
  sections: {
    title: string;
    content: string;
    type: 'text' | 'exercise' | 'reflection' | 'technique';
  }[];
  benefits: string[];
  suitableFor: { 
    emotions: Emotion[];
    vocalTones: VocalTone[];
  };
  relatedModules: string[];
}

// Collection of module content
const modulesContent: Record<string, ModuleContent> = {
  "Understanding Emotions": {
    title: "Understanding Emotions: Your Mind's Messaging System",
    sections: [
      {
        title: "What Are Emotions?",
        content: "Emotions are biological states associated with thoughts, feelings, behavioral responses, and varying degrees of pleasure or displeasure. They serve as important signals that communicate information about our internal state and help guide our decisions and behaviors.\n\nEmotions are neither good nor bad - they're information. Just like physical pain tells you something is wrong with your body, emotions tell you something about your psychological state.",
        type: "text"
      },
      {
        title: "The Purpose of Different Emotions",
        content: "• Happiness: Signals that something is beneficial to us and encourages us to continue engaging with whatever is causing it.\n\n• Sadness: Indicates loss and helps us process it, while also signaling to others that we need support.\n\n• Anger: Alerts us to injustice or boundary violations and mobilizes energy to address threats.\n\n• Fear: Warns us of potential danger and prepares the body for flight or fight responses.\n\n• Surprise: Focuses our attention on new information that may require quick adjustment.\n\n• Disgust: Protects us from potentially harmful or contaminated substances.",
        type: "text"
      },
      {
        title: "Reflection Exercise: Emotion Journal",
        content: "For one week, take a few minutes each day to write down:\n\n1. What emotions you experienced\n2. What triggered them\n3. How you responded\n4. What message the emotion might be trying to send you\n\nAt the end of the week, look for patterns in your emotional responses and triggers.",
        type: "exercise"
      }
    ],
    benefits: [
      "Improved emotional awareness",
      "Better understanding of your reactions",
      "Enhanced communication about feelings",
      "Reduced judgment of emotional experiences"
    ],
    suitableFor: {
      emotions: ["neutral", "calm", "happy", "sad", "angry", "fearful", "surprised", "disgusted"],
      vocalTones: ["neutral", "calm", "excited", "sad", "angry", "anxious", "uncertain"]
    },
    relatedModules: ["Mindfulness Basics", "Managing Anger", "Coping with Sadness"]
  },
  "Breathing Techniques": {
    title: "Breathing Techniques: Your Anchor in Emotional Storms",
    sections: [
      {
        title: "The Science of Breath",
        content: "Your breath is directly connected to your autonomic nervous system - the system that controls your fight-or-flight and rest-and-digest responses. By changing how you breathe, you can directly influence your physiological state and shift from stress to calm.",
        type: "text"
      },
      {
        title: "4-7-8 Breathing",
        content: "This technique acts like a natural tranquilizer for your nervous system:\n\n1. Sit or lie in a comfortable position\n2. Place the tip of your tongue against the ridge behind your upper front teeth\n3. Exhale completely through your mouth, making a whoosh sound\n4. Close your mouth and inhale quietly through your nose to a count of 4\n5. Hold your breath for a count of 7\n6. Exhale completely through your mouth to a count of 8\n7. Repeat this cycle 3-4 times",
        type: "technique"
      },
      {
        title: "Box Breathing",
        content: "Used by Navy SEALs to stay calm under pressure:\n\n1. Inhale slowly through your nose for 4 counts\n2. Hold your breath for 4 counts\n3. Exhale slowly through your mouth for 4 counts\n4. Hold your breath for 4 counts\n5. Repeat for 5 minutes or until you feel calmer",
        type: "technique"
      },
      {
        title: "Belly Breathing",
        content: "This technique helps activate your parasympathetic nervous system:\n\n1. Sit or lie comfortably with one hand on your chest and the other on your belly\n2. Breathe in slowly through your nose, feeling your belly rise while your chest remains relatively still\n3. Exhale slowly through pursed lips\n4. Focus on the sensation of your breath and the movement of your belly\n5. Continue for 3-5 minutes",
        type: "technique"
      }
    ],
    benefits: [
      "Immediate reduction in anxiety and stress",
      "Lower blood pressure and heart rate",
      "Improved focus and concentration",
      "Better emotional regulation in challenging situations"
    ],
    suitableFor: {
      emotions: ["angry", "fearful", "surprised", "disgusted"],
      vocalTones: ["angry", "anxious", "uncertain", "excited"]
    },
    relatedModules: ["Managing Anger", "Understanding Anxiety", "Mindfulness Basics"]
  },
  "Gratitude Practice": {
    title: "Gratitude Practice: Training Your Brain to Notice the Good",
    sections: [
      {
        title: "The Science of Gratitude",
        content: "Numerous studies show that practicing gratitude increases happiness, reduces depression, strengthens relationships, improves sleep, and even boosts immune function. When we consciously focus on things we're grateful for, we're training our brain to notice positive aspects of life, which counteracts our natural negativity bias.",
        type: "text"
      },
      {
        title: "Daily Gratitude Journal",
        content: "Each evening, write down three specific things you're grateful for that day. They can be small (a delicious meal) or significant (a supportive relationship). For each item, write:\n\n1. What you're grateful for\n2. Why you're grateful for it\n3. How it made you feel\n\nBeing specific and detailed helps activate the positive emotions associated with gratitude.",
        type: "exercise"
      },
      {
        title: "Gratitude Letter",
        content: "Think of someone who has positively impacted your life but whom you've never properly thanked. Write them a letter expressing your gratitude in detail. Explain what they did, why it was meaningful, and how it affected your life. You can choose to send the letter or keep it for yourself - the act of writing it is powerful either way.",
        type: "exercise"
      },
      {
        title: "Gratitude Meditation",
        content: "Find a quiet place and sit comfortably. Close your eyes and take a few deep breaths to center yourself. Then:\n\n1. Bring to mind something or someone you're grateful for\n2. Notice any sensations in your body as you hold this gratitude in your awareness\n3. Silently express thanks, allowing yourself to fully experience the positive feelings\n4. Continue with different things you're grateful for\n\nStart with 5 minutes and gradually increase the time.",
        type: "technique"
      }
    ],
    benefits: [
      "Reduced depressive symptoms",
      "Increased sense of life satisfaction",
      "Improved relationships",
      "Greater resilience during challenging times"
    ],
    suitableFor: {
      emotions: ["sad", "neutral", "angry"],
      vocalTones: ["sad", "neutral", "uncertain"]
    },
    relatedModules: ["Coping with Sadness", "Mindful Happiness"]
  },
  "Managing Anger": {
    title: "Managing Anger: Transforming Fire into Productive Energy",
    sections: [
      {
        title: "Understanding Your Anger",
        content: "Anger is a natural emotion that serves important purposes - it alerts us to injustice, boundary violations, and threats. The goal isn't to eliminate anger but to express it in healthy, constructive ways. Anger often masks other emotions like hurt, fear, or shame, which is why understanding its triggers is essential.",
        type: "text"
      },
      {
        title: "Identifying Your Anger Triggers",
        content: "Keep an anger journal for one week, noting:\n\n1. What situations triggered your anger\n2. Physical sensations you experienced (increased heart rate, tension, etc.)\n3. Thoughts that accompanied the anger\n4. What you did in response\n5. The underlying emotions beneath the anger (if any)\n\nLook for patterns to become more aware of your personal triggers.",
        type: "exercise"
      },
      {
        title: "The STOP Technique",
        content: "When you feel anger rising, practice the STOP technique:\n\nS - Stop what you're doing\nT - Take a deep breath\nO - Observe what's happening in your body and mind\nP - Proceed with a more mindful response\n\nThis creates a crucial pause between stimulus and response, giving you choice rather than reacting automatically.",
        type: "technique"
      },
      {
        title: "Healthy Expression",
        content: "Constructive ways to express anger include:\n\n• Using 'I' statements: \"I feel frustrated when...\" instead of \"You always...\"\n• Physical activity: Exercise releases tension and stress hormones\n• Writing: Express your feelings in a letter you don't send\n• Timeout: Remove yourself temporarily until you can respond calmly\n• Creative outlets: Channel anger into art, music, or other creative pursuits",
        type: "technique"
      }
    ],
    benefits: [
      "Improved relationships",
      "Better problem-solving abilities",
      "Reduced stress and anxiety",
      "Increased emotional intelligence"
    ],
    suitableFor: {
      emotions: ["angry", "disgusted"],
      vocalTones: ["angry", "excited"]
    },
    relatedModules: ["Breathing Techniques", "Understanding Emotions"]
  },
  "Coping with Sadness": {
    title: "Coping with Sadness: Finding Light in Dark Times",
    sections: [
      {
        title: "Sadness vs. Depression",
        content: "Sadness is a normal, healthy emotion that responds to loss, disappointment, or difficult life changes. Unlike depression, sadness usually passes with time and doesn't persistently interfere with daily functioning. While sadness is uncomfortable, it serves important purposes - it helps us process loss, signals to others that we need support, and deepens our capacity for empathy.",
        type: "text"
      },
      {
        title: "The Emotional Wave Technique",
        content: "When sadness arises, try this practice:\n\n1. Find a quiet place where you won't be disturbed\n2. Close your eyes and notice where you feel sadness in your body\n3. Visualize the feeling as a wave - it rises, crests, and eventually subsides\n4. Rather than resisting the wave, imagine riding it\n5. Breathe deeply and allow the feeling to be present without judgment\n6. Notice that the intensity naturally changes over time\n\nThis practice helps you build tolerance for difficult emotions.",
        type: "technique"
      },
      {
        title: "Behavioral Activation",
        content: "Sadness often leads to withdrawal, which can worsen our mood. Behavioral activation counters this cycle:\n\n1. Make a list of activities that normally bring you joy or satisfaction\n2. When feeling sad, choose one small activity from your list\n3. Commit to doing it even if you don't feel motivated\n4. Notice how your mood shifts, even slightly, during or after the activity\n5. Gradually increase the frequency and variety of activities\n\nThe key insight: action often comes before motivation, not after it.",
        type: "exercise"
      },
      {
        title: "Self-Compassion Practice",
        content: "When experiencing sadness, try this three-step practice:\n\n1. Mindfulness: Acknowledge your pain without judgment (\"This is a moment of suffering\")\n2. Common humanity: Remind yourself that suffering is universal (\"Many others feel this way too\")\n3. Self-kindness: Offer yourself comfort (\"May I be kind to myself in this difficult time\")\n\nPlace a hand on your heart as you say these phrases to yourself.",
        type: "exercise"
      }
    ],
    benefits: [
      "Increased emotional resilience",
      "Better ability to process difficult experiences",
      "Improved self-compassion",
      "Reduced likelihood of depression"
    ],
    suitableFor: {
      emotions: ["sad"],
      vocalTones: ["sad", "uncertain"]
    },
    relatedModules: ["Gratitude Practice", "Understanding Emotions", "Mindfulness Basics"]
  },
  "Mindful Happiness": {
    title: "Mindful Happiness: Savoring the Present Moment",
    sections: [
      {
        title: "Beyond Fleeting Pleasure",
        content: "True happiness isn't just about feeling good momentarily - it's about cultivating a deeper sense of contentment and meaning that persists even when life is challenging. Mindful happiness involves noticing and savoring positive experiences while maintaining awareness that all emotions and states are temporary.",
        type: "text"
      },
      {
        title: "The Savoring Practice",
        content: "Savoring helps us extract maximum enjoyment from positive experiences:\n\n1. Choose an everyday pleasant activity (eating a meal, taking a shower, walking outside)\n2. Engage all your senses - what do you see, hear, feel, smell, and taste?\n3. Slow down and notice details you normally miss\n4. Mentally note what you find pleasurable about the experience\n5. When your mind wanders, gently bring it back to the sensory experience\n\nPractice daily with different activities.",
        type: "technique"
      },
      {
        title: "Three Good Things Exercise",
        content: "This evidence-based practice boosts happiness and reduces depression:\n\n1. Each night before bed, write down three good things that happened that day\n2. They can be significant events or small moments\n3. For each good thing, write down:\n   - What happened\n   - Your role in bringing it about\n   - Why it was meaningful to you\n\nDoing this consistently trains your brain to notice and remember positive experiences.",
        type: "exercise"
      },
      {
        title: "Loving-Kindness Meditation",
        content: "This practice cultivates goodwill toward yourself and others:\n\n1. Sit comfortably and take a few deep breaths\n2. Bring to mind someone you care about deeply\n3. Silently repeat these phrases:\n   - May you be happy\n   - May you be healthy\n   - May you be safe\n   - May you live with ease\n4. Direct the same wishes toward yourself\n5. Gradually extend to acquaintances, difficult people, and all beings\n\nStart with 5 minutes daily and increase gradually.",
        type: "technique"
      }
    ],
    benefits: [
      "Increased positive emotions",
      "Greater appreciation for everyday experiences",
      "Improved relationship satisfaction",
      "Enhanced psychological resilience"
    ],
    suitableFor: {
      emotions: ["happy", "neutral", "calm"],
      vocalTones: ["excited", "neutral", "calm"]
    },
    relatedModules: ["Gratitude Practice", "Mindfulness Basics"]
  },
  "Understanding Anxiety": {
    title: "Understanding Anxiety: Making Friends with Fear",
    sections: [
      {
        title: "The Anxiety Response",
        content: "Anxiety is your body's natural response to perceived threats. It involves physical sensations (racing heart, shallow breathing), thoughts (worry, catastrophizing), and behaviors (avoidance, seeking reassurance). While uncomfortable, anxiety is designed to protect you by preparing your body to respond to danger. Problems arise when this system activates too frequently or intensely, or in situations that don't warrant a threat response.",
        type: "text"
      },
      {
        title: "Anxiety in Your Body",
        content: "Understanding the physical manifestations of anxiety can help you recognize it earlier:\n\n• Increased heart rate and breathing\n• Muscle tension\n• Digestive changes (butterflies, nausea)\n• Sweating or chills\n• Dizziness or lightheadedness\n• Difficulty concentrating\n\nThese sensations are caused by adrenaline and cortisol - hormones that prepare your body for 'fight or flight'.",
        type: "text"
      },
      {
        title: "The Worry Record",
        content: "When experiencing anxiety, complete this exercise:\n\n1. What am I worried about?\n2. How likely is this worry to come true? (0-100%)\n3. What's the worst that could happen?\n4. Could I cope with that? How?\n5. What's most likely to actually happen?\n6. What's a more balanced perspective?\n\nRegularly practicing this helps you develop more realistic thought patterns.",
        type: "exercise"
      },
      {
        title: "Grounding Technique: 5-4-3-2-1",
        content: "When anxiety spikes, use this sensory awareness exercise:\n\n5 - Notice FIVE things you can see\n4 - Notice FOUR things you can touch/feel\n3 - Notice THREE things you can hear\n2 - Notice TWO things you can smell\n1 - Notice ONE thing you can taste\n\nThis technique interrupts the anxiety cycle by anchoring you in your present sensory experience.",
        type: "technique"
      }
    ],
    benefits: [
      "Reduced physical symptoms of anxiety",
      "Improved ability to distinguish between true and false alarms",
      "Less avoidance of anxiety-provoking situations",
      "Better emotional regulation skills"
    ],
    suitableFor: {
      emotions: ["fearful", "surprised"],
      vocalTones: ["anxious", "uncertain"]
    },
    relatedModules: ["Breathing Techniques", "Mindfulness Basics"]
  },
  "Mindfulness Basics": {
    title: "Mindfulness Basics: Training Your Attention Muscle",
    sections: [
      {
        title: "What is Mindfulness?",
        content: "Mindfulness is the practice of paying attention to your present moment experience with openness, curiosity, and acceptance. It involves observing your thoughts, emotions, and sensations without getting caught up in them or judging them as good or bad. Research shows mindfulness practice changes brain structure and function in areas related to attention, emotional regulation, and self-awareness.",
        type: "text"
      },
      {
        title: "Basic Breath Awareness",
        content: "This foundational practice trains attention:\n\n1. Sit comfortably with your back straight but not rigid\n2. Close your eyes or lower your gaze\n3. Bring your attention to the physical sensations of breathing\n4. Notice where you feel your breath most prominently (nose, chest, abdomen)\n5. When your mind wanders (which is normal), gently return your attention to the breath\n\nStart with 5 minutes daily and gradually increase.",
        type: "technique"
      },
      {
        title: "Mindful Eating Exercise",
        content: "This practice helps develop sensory awareness:\n\n1. Choose a small piece of food (raisin, berry, nut)\n2. Examine it carefully, noticing colors, textures, and shapes\n3. Smell it, noticing any aromas and your body's reaction\n4. Place it in your mouth without chewing, exploring the sensations\n5. Slowly begin chewing, noticing flavors, textures, and how they change\n6. Swallow consciously, tracking the sensations\n\nThis exercise can be extended to regular meals.",
        type: "exercise"
      },
      {
        title: "R.A.I.N. for Difficult Emotions",
        content: "When challenging emotions arise, try this approach:\n\nR - Recognize what's happening (\"I'm feeling anxiety\")\nA - Allow the experience to be there, without trying to change it\nI - Investigate with kindness (\"Where do I feel this in my body?\")\nN - Non-identification (\"This is a feeling, not who I am\")\n\nThis framework helps you relate to emotions with greater balance and compassion.",
        type: "technique"
      }
    ],
    benefits: [
      "Reduced stress and anxiety",
      "Improved attention and concentration",
      "Greater emotional regulation",
      "Enhanced self-awareness"
    ],
    suitableFor: {
      emotions: ["calm", "neutral", "happy", "sad", "angry", "fearful"],
      vocalTones: ["calm", "neutral", "uncertain", "anxious"]
    },
    relatedModules: ["Breathing Techniques", "Body Scan Meditation", "Understanding Emotions"]
  },
  "Body Scan Meditation": {
    title: "Body Scan Meditation: Reconnecting with Your Physical Self",
    sections: [
      {
        title: "Mind-Body Connection",
        content: "The body scan meditation helps rebuild awareness of the mind-body connection, which is often lost in our busy, thought-dominated lives. This practice helps you notice subtle physical sensations, areas of tension, and emotional feelings as they manifest in the body. Regular practice can improve body awareness, reduce stress, enhance sleep quality, and help manage chronic pain.",
        type: "text"
      },
      {
        title: "Guided Body Scan Practice",
        content: "Try this 10-minute practice:\n\n1. Lie down in a comfortable position or sit with your back supported\n2. Close your eyes and take several deep breaths\n3. Bring attention to your feet, noticing any sensations (temperature, pressure, tingling)\n4. Slowly move your attention upward through your body - ankles, calves, knees, thighs\n5. Continue through your entire body, spending about 30 seconds with each area\n6. For each region, first notice sensations, then intentionally relax that area\n7. If you notice pain or discomfort, acknowledge it with kindness before moving on\n8. End by becoming aware of your body as a whole\n\nPractice regularly, ideally daily.",
        type: "technique"
      },
      {
        title: "Mini Body Scan for Stress",
        content: "This shorter version can be used throughout the day, especially during stressful moments:\n\n1. Pause what you're doing and take a deep breath\n2. Quickly scan your body for areas of tension (common spots include jaw, shoulders, neck, hands)\n3. As you exhale, imagine sending the breath to those tense areas\n4. Consciously release the tension with each exhalation\n5. Continue for 3-5 breath cycles\n\nThis practice helps prevent stress accumulation throughout the day.",
        type: "technique"
      },
      {
        title: "Body Mapping Exercise",
        content: "This reflective practice deepens body awareness:\n\n1. On a piece of paper, draw a simple outline of a human body\n2. After a body scan meditation, note where you felt different sensations\n3. Use colors to represent different feelings (e.g., red for tension, blue for relaxation)\n4. Add notes about specific sensations in different areas\n5. Observe patterns over time by keeping these maps for reference\n\nThis visual record helps you recognize how emotions and stress manifest in your unique body.",
        type: "exercise"
      }
    ],
    benefits: [
      "Increased body awareness",
      "Reduced physical tension",
      "Improved sleep quality",
      "Better stress management"
    ],
    suitableFor: {
      emotions: ["calm", "neutral", "fearful"],
      vocalTones: ["calm", "neutral", "anxious"]
    },
    relatedModules: ["Mindfulness Basics", "Breathing Techniques"]
  },
  "Sharing Positivity": {
    title: "Sharing Positivity: Extending Your Joy to Others",
    sections: [
      {
        title: "The Ripple Effect",
        content: "Positive emotions are contagious. Research shows that happiness can spread through social networks up to three degrees of separation - affecting friends of friends of friends! When you share your positive emotions and engage in acts of kindness, you not only boost others' wellbeing but also enhance your own happiness, creating a mutually reinforcing cycle of positivity.",
        type: "text"
      },
      {
        title: "Active-Constructive Responding",
        content: "When someone shares good news with you, your response can either strengthen or undermine your relationship:\n\n1. Active-Constructive (Best): Enthusiastic, supportive response that asks for details\n   Example: \"That's amazing! Tell me more about how it happened!\"\n\n2. Passive-Constructive: Supportive but understated\n   Example: \"That's nice.\"\n\n3. Active-Destructive: Pointing out negatives\n   Example: \"Sounds like a lot of responsibility. Are you sure you can handle it?\"\n\n4. Passive-Destructive: Ignoring or changing the subject\n   Example: \"By the way, did you see that new movie?\"\n\nPractice responding to others' good news with genuine enthusiasm and interest.",
        type: "technique"
      },
      {
        title: "Random Acts of Kindness Challenge",
        content: "For one week, commit to performing three acts of kindness each day. They can be small (complimenting a stranger) or larger (volunteering time). For each act, note:\n\n1. What you did\n2. The recipient's reaction (if observable)\n3. How it made you feel\n\nAt the end of the week, reflect on which acts were most meaningful to you and why.",
        type: "exercise"
      },
      {
        title: "Strengths Spotting",
        content: "This practice helps you recognize and acknowledge others' positive qualities:\n\n1. Each day, identify one strength or positive quality in someone you interact with\n2. Share your observation with them specifically (\"I really appreciate how thoughtful you are about...\")\n3. Note how they respond and how the interaction affects your relationship\n\nMaking this a habit trains you to notice the good in others and strengthens social connections.",
        type: "exercise"
      }
    ],
    benefits: [
      "Stronger interpersonal relationships",
      "Increased personal happiness",
      "Creation of positive social environments",
      "Enhanced sense of meaning and purpose"
    ],
    suitableFor: {
      emotions: ["happy", "calm"],
      vocalTones: ["excited", "calm"]
    },
    relatedModules: ["Mindful Happiness", "Gratitude Practice"]
  }
};

// Define a type for recommendable module names
type ModuleName = keyof typeof modulesContent;

export default function ModulesPage() {
  const [selectedModule, setSelectedModule] = useState<ModuleContent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dominantEmotion, setDominantEmotion] = useState<Emotion>('neutral');
  const [secondaryEmotion, setSecondaryEmotion] = useState<Emotion | null>(null);
  const [dominantVocalTone, setDominantVocalTone] = useState<VocalTone | null>(null);
  const [recommendedModules, setRecommendedModules] = useState<ModuleName[]>([]);
  
  // Calculate dominant emotion and recommend modules on component mount
  useEffect(() => {
    // Get emotional data
    const emotionHistory = getEmotionHistory();
    const vocalToneHistory = getVocalToneHistory();
    
    // Create emotion counts
    const emotionCounts: Record<string, number> = {};
    emotionHistory.forEach(item => {
      emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
    });
    
    // Create vocal tone counts
    const vocalToneCounts: Record<string, number> = {};
    vocalToneHistory.forEach(item => {
      vocalToneCounts[item.tone] = (vocalToneCounts[item.tone] || 0) + 1;
    });
    
    // Find dominant emotion
    let maxEmotionCount = 0;
    let dominantEmotion: Emotion = 'neutral';
    let secondMaxCount = 0;
    let secondaryEmotion: Emotion | null = null;
    
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxEmotionCount) {
        // Move current dominant to secondary
        secondMaxCount = maxEmotionCount;
        secondaryEmotion = dominantEmotion;
        
        // Set new dominant
        maxEmotionCount = count;
        dominantEmotion = emotion as Emotion;
      } else if (count > secondMaxCount) {
        secondMaxCount = count;
        secondaryEmotion = emotion as Emotion;
      }
    });
    
    // Find dominant vocal tone
    let maxToneCount = 0;
    let dominantVocalTone: VocalTone | null = null;
    
    Object.entries(vocalToneCounts).forEach(([tone, count]) => {
      if (count > maxToneCount) {
        maxToneCount = count;
        dominantVocalTone = tone as VocalTone;
      }
    });
    
    // Update state with detected patterns
    setDominantEmotion(dominantEmotion);
    setSecondaryEmotion(secondaryEmotion);
    setDominantVocalTone(dominantVocalTone);
    
    // Generate module recommendations based on emotional state
    const recommendedModuleNames = recommendModulesBasedOnEmotionalState(
      dominantEmotion, 
      secondaryEmotion, 
      dominantVocalTone
    );
    
    setRecommendedModules(recommendedModuleNames);
  }, []);
  
  // Function to recommend modules based on emotional state
  const recommendModulesBasedOnEmotionalState = (
    primaryEmotion: Emotion,
    secondaryEmotion: Emotion | null,
    vocalTone: VocalTone | null
  ): ModuleName[] => {
    // Define score object for each module
    const moduleScores: Record<ModuleName, number> = {} as Record<ModuleName, number>;
    
    // Initialize all modules with a base score
    Object.keys(modulesContent).forEach(moduleName => {
      moduleScores[moduleName as ModuleName] = 0;
    });
    
    // Score modules based on emotional suitability
    Object.entries(modulesContent).forEach(([moduleName, content]) => {
      // Check primary emotion match (highest weight)
      if (content.suitableFor.emotions.includes(primaryEmotion)) {
        moduleScores[moduleName as ModuleName] += 3;
      }
      
      // Check secondary emotion match (medium weight)
      if (secondaryEmotion && content.suitableFor.emotions.includes(secondaryEmotion)) {
        moduleScores[moduleName as ModuleName] += 2;
      }
      
      // Check vocal tone match (lower weight)
      if (vocalTone && content.suitableFor.vocalTones.includes(vocalTone)) {
        moduleScores[moduleName as ModuleName] += 1;
      }
    });
    
    // Convert scores to sorted array of module names
    const sortedModules = Object.entries(moduleScores)
      .sort((a, b) => b[1] - a[1]) // Sort by descending score
      .map(entry => entry[0] as ModuleName);
    
    // Return top 3 modules
    return sortedModules.slice(0, 3);
  };
  
  // Function to check if a module is recommended
  const isModuleRecommended = (title: string): boolean => {
    return recommendedModules.includes(title as ModuleName);
  };
  
  // Handle opening module content dialog
  const openModuleContent = (title: ModuleName) => {
    setSelectedModule(modulesContent[title]);
    setIsDialogOpen(true);
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fadeIn">
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Mental Health Modules</CardTitle>
          <CardDescription>
            Educational resources and activities tailored to your emotional profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-secondary/30 rounded-lg border border-secondary/50">
            <h3 className="font-medium flex items-center mb-2">
              <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
              Personalized Recommendation
            </h3>
            <p>
              Based on your emotional patterns, we've recommended modules that may be most helpful for you.
              {dominantEmotion && (
                <span className="inline-flex items-center bg-secondary/50 px-2 py-1 rounded-md ml-2">
                  <span className="font-medium mr-1">Primary emotion:</span>
                  <span className="capitalize flex items-center gap-1">
                    <span>{dominantEmotion}</span>
                    <span className="text-lg ml-1">{EMOTION_ICONS[dominantEmotion] || '😐'}</span>
                  </span>
                </span>
              )}
              {secondaryEmotion && (
                <span className="inline-flex items-center bg-secondary/50 px-2 py-1 rounded-md ml-2">
                  <span className="font-medium mr-1">Secondary:</span>
                  <span className="capitalize flex items-center gap-1">
                    <span>{secondaryEmotion}</span>
                    <span className="text-lg ml-1">{EMOTION_ICONS[secondaryEmotion] || '😐'}</span>
                  </span>
                </span>
              )}
            </p>
          </div>
          
          <Tabs defaultValue={dominantEmotion !== 'neutral' ? dominantEmotion : 'all'}>
            <TabsList className="mb-4 bg-secondary/30 p-1">
              <TabsTrigger value="all">All Modules</TabsTrigger>
              <TabsTrigger value="happy">Happiness</TabsTrigger>
              <TabsTrigger value="sad">Sadness</TabsTrigger>
              <TabsTrigger value="angry">Anger</TabsTrigger>
              <TabsTrigger value="fearful">Anxiety</TabsTrigger>
              <TabsTrigger value="calm">Mindfulness</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <ModuleCard 
                  title="Understanding Emotions"
                  description="Learn to identify and understand different emotions and their purpose in your life."
                  icon={<Brain className="h-8 w-8 text-purple-500" />}
                  category="Education"
                  time="15 min"
                  recommended={isModuleRecommended("Understanding Emotions")}
                  onOpenContent={() => openModuleContent("Understanding Emotions")}
                />
                <ModuleCard 
                  title="Breathing Techniques"
                  description="Simple breathing exercises to help manage stress and anxiety in the moment."
                  icon={<ShieldPlus className="h-8 w-8 text-blue-500" />}
                  category="Exercise"
                  time="5 min"
                  recommended={isModuleRecommended("Breathing Techniques")}
                  onOpenContent={() => openModuleContent("Breathing Techniques")}
                />
                <ModuleCard 
                  title="Gratitude Practice"
                  description="Exercises to cultivate gratitude and positive thinking in your daily life."
                  icon={<Heart className="h-8 w-8 text-red-500" />}
                  category="Exercise"
                  time="10 min"
                  recommended={isModuleRecommended("Gratitude Practice")}
                  onOpenContent={() => openModuleContent("Gratitude Practice")}
                />
                <ModuleCard 
                  title="Managing Anger"
                  description="Techniques to recognize anger triggers and respond in healthier ways."
                  icon={<Zap className="h-8 w-8 text-amber-500" />}
                  category="Education"
                  time="20 min"
                  recommended={isModuleRecommended("Managing Anger")}
                  onOpenContent={() => openModuleContent("Managing Anger")}
                />
                <ModuleCard 
                  title="Coping with Sadness"
                  description="Understand the roots of sadness and learn healthy coping mechanisms."
                  icon={<Frown className="h-8 w-8 text-indigo-500" />}
                  category="Education"
                  time="15 min"
                  recommended={isModuleRecommended("Coping with Sadness")}
                  onOpenContent={() => openModuleContent("Coping with Sadness")}
                />
                <ModuleCard 
                  title="Mindful Happiness"
                  description="Learn to cultivate and appreciate moments of joy without attachment."
                  icon={<SmilePlus className="h-8 w-8 text-green-500" />}
                  category="Exercise"
                  time="10 min"
                  recommended={isModuleRecommended("Mindful Happiness")}
                  onOpenContent={() => openModuleContent("Mindful Happiness")}
                />
                <ModuleCard 
                  title="Understanding Anxiety"
                  description="Learn about the mechanics of anxiety and fear responses in the body and mind."
                  icon={<Brain className="h-8 w-8 text-purple-500" />}
                  category="Education"
                  time="15 min"
                  recommended={isModuleRecommended("Understanding Anxiety")}
                  onOpenContent={() => openModuleContent("Understanding Anxiety")}
                />
                <ModuleCard 
                  title="Mindfulness Basics"
                  description="Introduction to mindfulness practices for everyday mental well-being."
                  icon={<Brain className="h-8 w-8 text-teal-500" />}
                  category="Education"
                  time="10 min"
                  recommended={isModuleRecommended("Mindfulness Basics")}
                  onOpenContent={() => openModuleContent("Mindfulness Basics")}
                />
                <ModuleCard 
                  title="Body Scan Meditation"
                  description="A guided practice to bring awareness to each part of your body."
                  icon={<ShieldPlus className="h-8 w-8 text-blue-500" />}
                  category="Exercise"
                  time="15 min"
                  recommended={isModuleRecommended("Body Scan Meditation")}
                  onOpenContent={() => openModuleContent("Body Scan Meditation")}
                />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="happy">
              <motion.div 
                className="grid md:grid-cols-2 gap-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <ModuleCard 
                  title="Mindful Happiness"
                  description="Learn to cultivate and appreciate moments of joy without attachment."
                  icon={<SmilePlus className="h-8 w-8 text-green-500" />}
                  category="Exercise"
                  time="10 min"
                  recommended={isModuleRecommended("Mindful Happiness")}
                  onOpenContent={() => openModuleContent("Mindful Happiness")}
                />
                <ModuleCard 
                  title="Sharing Positivity"
                  description="Discover ways to channel your positive energy to help others around you."
                  icon={<Heart className="h-8 w-8 text-red-500" />}
                  category="Education"
                  time="12 min"
                  recommended={isModuleRecommended("Sharing Positivity")}
                  onOpenContent={() => openModuleContent("Sharing Positivity")}
                />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="sad">
              <motion.div 
                className="grid md:grid-cols-2 gap-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <ModuleCard 
                  title="Coping with Sadness"
                  description="Understand the roots of sadness and learn healthy coping mechanisms."
                  icon={<Frown className="h-8 w-8 text-indigo-500" />}
                  category="Education"
                  time="15 min"
                  recommended={true}
                  onOpenContent={() => openModuleContent("Coping with Sadness")}
                />
                <ModuleCard 
                  title="Gratitude Practice"
                  description="Exercises to cultivate gratitude and positive thinking in your daily life."
                  icon={<Heart className="h-8 w-8 text-red-500" />}
                  category="Exercise"
                  time="10 min"
                  recommended={true}
                  onOpenContent={() => openModuleContent("Gratitude Practice")}
                />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="angry">
              <motion.div 
                className="grid md:grid-cols-2 gap-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <ModuleCard 
                  title="Managing Anger"
                  description="Techniques to recognize anger triggers and respond in healthier ways."
                  icon={<Zap className="h-8 w-8 text-amber-500" />}
                  category="Education"
                  time="20 min"
                  recommended={true}
                  onOpenContent={() => openModuleContent("Managing Anger")}
                />
                <ModuleCard 
                  title="Breathing Techniques"
                  description="Simple breathing exercises to help manage stress and anger in the moment."
                  icon={<ShieldPlus className="h-8 w-8 text-blue-500" />}
                  category="Exercise"
                  time="5 min"
                  recommended={true}
                  onOpenContent={() => openModuleContent("Breathing Techniques")}
                />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="fearful">
              <motion.div 
                className="grid md:grid-cols-2 gap-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <ModuleCard 
                  title="Understanding Anxiety"
                  description="Learn about the mechanics of anxiety and fear responses in the body and mind."
                  icon={<Brain className="h-8 w-8 text-purple-500" />}
                  category="Education"
                  time="15 min"
                  recommended={true}
                  onOpenContent={() => openModuleContent("Understanding Anxiety")}
                />
                <ModuleCard 
                  title="Breathing Techniques"
                  description="Simple breathing exercises to help manage anxiety in the moment."
                  icon={<ShieldPlus className="h-8 w-8 text-blue-500" />}
                  category="Exercise"
                  time="5 min"
                  recommended={true}
                  onOpenContent={() => openModuleContent("Breathing Techniques")}
                />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="calm">
              <motion.div 
                className="grid md:grid-cols-2 gap-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <ModuleCard 
                  title="Mindfulness Basics"
                  description="Introduction to mindfulness practices for everyday mental well-being."
                  icon={<Brain className="h-8 w-8 text-teal-500" />}
                  category="Education"
                  time="10 min"
                  recommended={dominantEmotion === 'calm'}
                  onOpenContent={() => openModuleContent("Mindfulness Basics")}
                />
                <ModuleCard 
                  title="Body Scan Meditation"
                  description="A guided practice to bring awareness to each part of your body."
                  icon={<ShieldPlus className="h-8 w-8 text-blue-500" />}
                  category="Exercise"
                  time="15 min"
                  onOpenContent={() => openModuleContent("Body Scan Meditation")}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Dialog for module content */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedModule && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedModule.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedModule.benefits.map((benefit, index) => (
                      <span key={index} className="inline-flex items-center text-xs bg-secondary/30 px-2 py-1 rounded-full text-secondary-foreground">
                        <CheckCheck className="h-3 w-3 mr-1" />
                        {benefit}
                      </span>
                    ))}
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-4">
                {selectedModule.sections.map((section, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <h3 className="font-medium flex items-center mb-2">
                      {section.type === 'text' && <Sparkles className="h-4 w-4 mr-2 text-blue-500" />}
                      {section.type === 'exercise' && <BarChart className="h-4 w-4 mr-2 text-green-500" />}
                      {section.type === 'technique' && <CheckCheck className="h-4 w-4 mr-2 text-amber-500" />}
                      {section.type === 'reflection' && <Bookmark className="h-4 w-4 mr-2 text-purple-500" />}
                      {section.title}
                    </h3>
                    <div className="whitespace-pre-line text-sm">{section.content}</div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <List className="h-4 w-4 mr-2" />
                  Related Modules
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedModule.relatedModules.map((module, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        setSelectedModule(modulesContent[module as ModuleName]);
                      }}
                    >
                      {module}
                    </Button>
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <div className="flex justify-between w-full items-center">
                  <div className="text-xs flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Estimated time: {selectedModule.sections.length * 3}-{selectedModule.sections.length * 5} minutes
                  </div>
                  <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'Education' | 'Exercise' | 'Activity';
  time: string;
  recommended?: boolean;
  onOpenContent: () => void;
}

// Animation item variant defined outside to be accessible
const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function ModuleCard({ title, description, icon, category, time, recommended = false, onOpenContent }: ModuleCardProps) {
  return (
    <motion.div variants={itemVariant}>
      <Card className={`h-full transition-all duration-300 hover:shadow-md ${recommended ? 'border-amber-300 border-2' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary/30 rounded-full mb-2">
              {icon}
            </div>
            {recommended && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                Recommended
              </span>
            )}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-2 border-t">
          <span className="text-xs text-muted-foreground font-medium">{category} • {time}</span>
          <Button variant="outline" size="sm" className="text-sm" onClick={onOpenContent}>
            View
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}