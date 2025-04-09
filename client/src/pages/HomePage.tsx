import { useState } from "react";
import { Link } from "wouter";
import { Brain, MessageCircle, Mic, BarChart, BookOpen, ChevronDown, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MentalHealthTips from "@/components/shared/MentalHealthTips";
import { TherapeuticPulse, THERAPEUTIC_COLORS } from "@/components/ui/animations";

export default function HomePage() {
  // State for education module visibility
  const [showEducationModule, setShowEducationModule] = useState(false);
  
  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };
  
  // Hover animation for cards
  const cardHover = {
    rest: { scale: 1, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.05)" },
    hover: { 
      scale: 1.03, 
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };
  
  // Education module content
  const educationModules = [
    {
      id: "understanding-emotions",
      title: "Understanding Your Emotions",
      description: "Learn about the basic emotions, how to identify them, and why they matter.",
      content: (
        <div className="space-y-4">
          <p>Emotions are natural responses that help us interact with the world around us. Learning to identify and understand your emotions is an important step toward better mental health.</p>
          
          <h4 className="font-bold text-beige-700 mt-4">Basic Emotions</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-medium">Happiness:</span> Feelings of joy, contentment, satisfaction, and well-being</li>
            <li><span className="font-medium">Sadness:</span> Feelings of loss, disappointment, or helplessness</li>
            <li><span className="font-medium">Fear:</span> Response to threat or anticipation of threat</li>
            <li><span className="font-medium">Anger:</span> Response to perceived injustice or blocked goals</li>
            <li><span className="font-medium">Surprise:</span> Brief response to unexpected events</li>
            <li><span className="font-medium">Disgust:</span> Aversion to something offensive</li>
          </ul>
          
          <h4 className="font-bold text-beige-700 mt-4">How to Identify Your Emotions</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>Notice physical sensations in your body</li>
            <li>Pay attention to your thoughts</li>
            <li>Observe your behavior and actions</li>
            <li>Consider the situation and context</li>
          </ul>
          
          <div className="bg-beige-100 p-4 rounded-md mt-4">
            <p className="italic">Try asking: "What am I feeling right now?" several times throughout your day to build emotional awareness.</p>
          </div>
        </div>
      )
    },
    {
      id: "coping-strategies",
      title: "Healthy Coping Strategies",
      description: "Discover effective ways to manage difficult emotions and stress.",
      content: (
        <div className="space-y-4">
          <p>Coping strategies are techniques we use to manage difficult emotions and stressful situations. Learning healthy coping strategies can improve your resilience and emotional well-being.</p>
          
          <h4 className="font-bold text-beige-700 mt-4">Physical Coping Strategies</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-medium">Deep breathing:</span> Slow, deep breaths to activate your parasympathetic nervous system</li>
            <li><span className="font-medium">Progressive muscle relaxation:</span> Tensing and releasing muscle groups</li>
            <li><span className="font-medium">Physical exercise:</span> Walking, running, yoga, or any movement you enjoy</li>
            <li><span className="font-medium">Adequate rest:</span> Prioritizing good sleep hygiene</li>
          </ul>
          
          <h4 className="font-bold text-beige-700 mt-4">Mental Coping Strategies</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-medium">Mindfulness:</span> Paying attention to the present moment without judgment</li>
            <li><span className="font-medium">Journaling:</span> Writing down thoughts and feelings to process them</li>
            <li><span className="font-medium">Positive self-talk:</span> Challenging negative thoughts with more balanced perspectives</li>
            <li><span className="font-medium">Creative expression:</span> Art, music, writing, or other creative outlets</li>
          </ul>
          
          <div className="bg-beige-100 p-4 rounded-md mt-4">
            <p className="italic">Try to build a diverse "toolkit" of coping strategies to use in different situations. What works in one context might not work in another.</p>
          </div>
        </div>
      )
    },
    {
      id: "mindfulness-basics",
      title: "Mindfulness Basics",
      description: "Learn the fundamentals of mindfulness practice for emotional regulation.",
      content: (
        <div className="space-y-4">
          <p>Mindfulness is the practice of paying attention to the present moment with curiosity and without judgment. It can help reduce stress, improve focus, and enhance emotional regulation.</p>
          
          <h4 className="font-bold text-beige-700 mt-4">Key Principles of Mindfulness</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-medium">Present-moment awareness:</span> Focusing on what's happening right now</li>
            <li><span className="font-medium">Non-judgment:</span> Observing without labeling experiences as "good" or "bad"</li>
            <li><span className="font-medium">Acceptance:</span> Acknowledging things as they are, even difficult emotions</li>
            <li><span className="font-medium">Curiosity:</span> Approaching experiences with openness and interest</li>
          </ul>
          
          <h4 className="font-bold text-beige-700 mt-4">Simple Mindfulness Practices</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-medium">Mindful breathing:</span> Focus on your breath for 1-5 minutes</li>
            <li><span className="font-medium">Body scan:</span> Systematically notice sensations throughout your body</li>
            <li><span className="font-medium">Five senses exercise:</span> Notice 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell, and 1 you can taste</li>
            <li><span className="font-medium">Mindful activity:</span> Fully engage in a routine activity like washing dishes or walking</li>
          </ul>
          
          <div className="bg-beige-100 p-4 rounded-md mt-4">
            <p className="italic">Start with just 5 minutes of mindfulness practice daily. Consistency matters more than duration, especially when beginning.</p>
          </div>
        </div>
      )
    }
  ];
  
  // Use a fixed therapeutic mood - 'calm' for consistency
  const currentMood = 'calm';

  return (
    <div className="min-h-screen py-8 px-4"
         style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)" }}>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <TherapeuticPulse 
            color={THERAPEUTIC_COLORS[currentMood][3]} 
            size={80} 
            className="mx-auto mb-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.3,
                type: "spring",
                stiffness: 100
              }}
            >
              <Brain className="mx-auto h-16 w-16 text-white" />
            </motion.div>
          </TherapeuticPulse>
          
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-blue-700 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Welcome to Therapeutic AI
          </motion.h1>
          
          <motion.p 
            className="text-xl text-blue-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            A safe space where artificial intelligence helps you process your thoughts
            and feelings through voice or text interaction.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-6 mb-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <motion.div
              whileHover="hover"
              initial="rest"
              animate="rest"
              variants={cardHover}
            >
              <Card className="bg-beige-100 h-full transition-all duration-300 border-2 border-beige-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-beige-700">
                    <Mic className="mr-2 h-5 w-5" />
                    Voice Therapy
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <p className="text-beige-600 mb-6 flex-grow">
                    Speak naturally with our AI therapist that analyzes your facial expressions
                    and vocal tone to provide personalized therapeutic responses.
                  </p>
                  <Link href="/voice" className="block">
                    <Button className="w-full bg-beige-500 hover:bg-beige-600 text-white transition-all duration-300 transform hover:translate-y-[-2px]">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-center"
                      >
                        <Mic className="mr-2 h-4 w-4" />
                        Start Voice Session
                      </motion.span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={item}>
            <motion.div
              whileHover="hover"
              initial="rest"
              animate="rest"
              variants={cardHover}
            >
              <Card className="bg-beige-100 h-full transition-all duration-300 border-2 border-beige-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-beige-700">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Text Therapy
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <p className="text-beige-600 mb-6 flex-grow">
                    Type your thoughts and feelings in a private chat with our AI therapist
                    that provides thoughtful, empathetic responses to your messages.
                  </p>
                  <Link href="/text" className="block">
                    <Button className="w-full bg-beige-500 hover:bg-beige-600 text-white transition-all duration-300 transform hover:translate-y-[-2px]">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-center"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Start Text Session
                      </motion.span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={item}
            className="md:col-span-2"
          >
            <motion.div
              whileHover="hover"
              initial="rest"
              animate="rest"
              variants={cardHover}
            >
              <Card className="bg-beige-100 transition-all duration-300 border-2 border-beige-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-beige-700">
                    <BarChart className="mr-2 h-5 w-5" />
                    Emotion Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-beige-600 mb-6">
                    Track your emotional patterns over time with our statistics dashboard.
                    See how your mood changes throughout your therapy sessions.
                  </p>
                  <Link href="/stats" className="block">
                    <Button className="w-full bg-beige-500 hover:bg-beige-600 text-white transition-all duration-300 transform hover:translate-y-[-2px]">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-center"
                      >
                        <BarChart className="mr-2 h-4 w-4" />
                        View Statistics
                      </motion.span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={item}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="space-y-6"
        >
          {/* Mental Health Education Card */}
          <motion.div
            whileHover="hover"
            initial="rest"
            animate="rest"
            variants={cardHover}
          >
            <Card className="bg-beige-100 transition-all duration-300 border-2 border-beige-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-beige-700">
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Mental Health Education
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowEducationModule(!showEducationModule)}
                    className="text-beige-600 hover:text-beige-800"
                  >
                    {showEducationModule ? "Hide Modules" : "Show Modules"}
                    {showEducationModule ? 
                      <ChevronDown className="ml-2 h-4 w-4" /> : 
                      <ChevronRight className="ml-2 h-4 w-4" />
                    }
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-beige-600 mb-4">
                  Learn about emotions, coping strategies, and mindfulness techniques to enhance your mental well-being.
                </p>
                
                <AnimatePresence>
                  {showEducationModule && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <Accordion type="single" collapsible className="mt-4">
                        {educationModules.map((module) => (
                          <AccordionItem key={module.id} value={module.id} className="border-beige-200">
                            <AccordionTrigger className="hover:text-beige-700 text-beige-600 font-medium">
                              <div className="flex items-start text-left">
                                <Info className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div>{module.title}</div>
                                  <div className="text-sm font-normal text-beige-500">{module.description}</div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-beige-600">
                              {module.content}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Mental Health Tips Carousel */}
          <motion.div
            whileHover="hover"
            initial="rest"
            animate="rest"
            variants={cardHover}
          >
            <Card className="bg-primary/5 border-2 border-primary/10 mb-6">
              <CardContent className="pt-6">
                <MentalHealthTips />
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Why Therapeutic AI Card */}
          <Card className="bg-beige-50 border-2 border-beige-200">
            <CardHeader>
              <CardTitle className="text-beige-700">Why Therapeutic AI?</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.ul 
                className="space-y-4 text-beige-600"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.li variants={item} className="flex items-start">
                  <span className="font-bold mr-2 text-green-500">✓</span>
                  <span>Private and confidential conversations that stay on your device</span>
                </motion.li>
                <motion.li variants={item} className="flex items-start">
                  <span className="font-bold mr-2 text-green-500">✓</span>
                  <span>Available 24/7 for emotional support whenever you need it</span>
                </motion.li>
                <motion.li variants={item} className="flex items-start">
                  <span className="font-bold mr-2 text-green-500">✓</span>
                  <span>No judgment - express yourself freely in a safe environment</span>
                </motion.li>
                <motion.li variants={item} className="flex items-start">
                  <span className="font-bold mr-2 text-green-500">✓</span>
                  <span>Uses advanced AI to provide meaningful, therapeutic responses</span>
                </motion.li>
                <motion.li variants={item} className="flex items-start">
                  <span className="font-bold mr-2 text-amber-500">⚠️</span>
                  <span className="text-beige-700 font-medium">This is not a replacement for professional mental health services</span>
                </motion.li>
              </motion.ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}