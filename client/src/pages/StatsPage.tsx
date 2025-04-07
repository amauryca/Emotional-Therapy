import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Link } from 'wouter';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getEmotionHistory } from '@/lib/faceApiLoader';
import { getVocalToneHistory } from '@/lib/ai';
import { Emotion, VocalTone } from '@/types';

// Emotion colors
const EMOTION_COLORS = {
  happy: '#4CAF50',
  sad: '#5C6BC0',
  angry: '#F44336',
  surprised: '#FFC107',
  fearful: '#9C27B0',
  disgusted: '#795548',
  neutral: '#9E9E9E',
  calm: '#00BCD4'
};

// Vocal tone colors
const TONE_COLORS = {
  excited: '#FF9800',
  sad: '#5C6BC0',
  angry: '#F44336',
  anxious: '#673AB7',
  neutral: '#9E9E9E',
  calm: '#00BCD4',
  uncertain: '#607D8B'
};

// Enhanced data structure
interface EmotionData {
  timestamp: Date;
  emotion: string;
  intensity: number;
  session: string;
}

export default function StatsPage() {
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load emotion data from real sources and localStorage
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      
      try {
        // Get real-time emotion data from face detection and voice analysis
        const faceEmotions = getEmotionHistory();
        const voiceTones = getVocalToneHistory();
        
        // Try to load stored data from localStorage as well
        const storedData = localStorage.getItem('emotionStats');
        let parsedStoredData: EmotionData[] = [];
        
        if (storedData) {
          // Convert string timestamps back to Date objects
          parsedStoredData = JSON.parse(storedData).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
        }
        
        // Convert face emotion data to our format
        const faceData: EmotionData[] = faceEmotions.map(item => ({
          timestamp: item.timestamp,
          emotion: item.emotion,
          intensity: 80, // Default high intensity for detected emotions
          session: 'voice' // Face detection happens during voice therapy
        }));
        
        // Convert vocal tone data to our format
        const voiceData: EmotionData[] = voiceTones.map(item => ({
          timestamp: item.timestamp,
          emotion: mapVocalToneToEmotion(item.tone),
          intensity: Math.round(item.confidence * 100),
          session: 'voice'
        }));
        
        // Combine all sources of data
        const combinedData = [...faceData, ...voiceData, ...parsedStoredData];
        
        // Sort by timestamp
        combinedData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        if (combinedData.length > 0) {
          setEmotionData(combinedData);
          
          // Save combined data to localStorage for future sessions
          localStorage.setItem('emotionStats', JSON.stringify(combinedData));
        } else if (parsedStoredData.length > 0) {
          // If no real-time data but we have stored data
          setEmotionData(parsedStoredData);
        } else {
          // If no data exists anywhere, create initial data structure
          setEmotionData([]);
        }
      } catch (error) {
        console.error('Error loading emotion data:', error);
        // Try to load from localStorage as a fallback
        const storedData = localStorage.getItem('emotionStats');
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData).map((item: any) => ({
              ...item,
              timestamp: new Date(item.timestamp)
            }));
            setEmotionData(parsedData);
          } catch (e) {
            setEmotionData([]);
          }
        } else {
          setEmotionData([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Set up interval to refresh data every 30 seconds while on the stats page
    const refreshInterval = setInterval(loadData, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Helper function to map vocal tones to emotions
  const mapVocalToneToEmotion = (tone: VocalTone): string => {
    const mapping: Record<VocalTone, Emotion> = {
      'excited': 'happy',
      'sad': 'sad',
      'angry': 'angry',
      'anxious': 'fearful',
      'neutral': 'neutral',
      'calm': 'calm',
      'uncertain': 'surprised'
    };
    return mapping[tone] || 'neutral';
  };
  
  // Clear all stored data
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all emotion tracking data?')) {
      localStorage.removeItem('emotionStats');
      setEmotionData([]);
    }
  };
  
  // Prepare data for charts
  const prepareEmotionDistribution = () => {
    const emotionCounts: {[key: string]: number} = {};
    
    emotionData.forEach(data => {
      emotionCounts[data.emotion] = (emotionCounts[data.emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      name: emotion,
      value: count
    }));
  };
  
  const prepareEmotionTimeline = () => {
    // Group by date
    const groupedByDate: {[key: string]: {[key: string]: number}} = {};
    
    emotionData.forEach(data => {
      const dateStr = data.timestamp.toLocaleDateString();
      
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = {};
      }
      
      groupedByDate[dateStr][data.emotion] = (groupedByDate[dateStr][data.emotion] || 0) + 1;
    });
    
    // Convert to array format
    return Object.entries(groupedByDate).map(([date, emotions]) => {
      return {
        date,
        ...emotions
      };
    });
  };
  
  const prepareSessionComparison = () => {
    const sessions = {
      voice: {
        happy: 0,
        sad: 0,
        angry: 0,
        surprised: 0,
        neutral: 0,
        fearful: 0,
        disgusted: 0,
        calm: 0
      },
      text: {
        happy: 0,
        sad: 0,
        angry: 0,
        surprised: 0,
        neutral: 0,
        fearful: 0,
        disgusted: 0,
        calm: 0
      }
    };
    
    emotionData.forEach(data => {
      if (sessions[data.session as keyof typeof sessions] && 
          data.emotion in sessions[data.session as keyof typeof sessions]) {
        // @ts-ignore - Dynamic access
        sessions[data.session][data.emotion]++;
      }
    });
    
    const result = [];
    for (const emotion of Object.keys(sessions.voice)) {
      result.push({
        emotion,
        voice: sessions.voice[emotion as keyof typeof sessions.voice],
        text: sessions.text[emotion as keyof typeof sessions.text]
      });
    }
    
    return result;
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
        stiffness: 100
      }
    }
  };
  
  // Return loading state or charts
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="animate-spin h-8 w-8 text-beige-500" />
          <span className="ml-2 text-beige-600">Loading emotion statistics...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="outline" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-beige-800">
            Emotion Statistics
          </h1>
        </div>
        
        <Button 
          variant="outline" 
          className="text-red-500 border-red-200 hover:bg-red-50"
          onClick={handleClearData}
        >
          Clear Data
        </Button>
      </div>
      
      {emotionData.length === 0 ? (
        <Card className="bg-beige-50 border-beige-200 text-center py-12">
          <CardContent>
            <p className="text-beige-600 mb-4">No emotion data available yet.</p>
            <p className="text-beige-500 text-sm">
              Use the voice or text therapy features to start tracking your emotions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Emotion Distribution Pie Chart */}
          <motion.div variants={item}>
            <Card className="bg-beige-50 border-beige-200">
              <CardHeader>
                <CardTitle>Emotion Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareEmotionDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareEmotionDistribution().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={EMOTION_COLORS[entry.name as keyof typeof EMOTION_COLORS] || '#999999'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Emotion Timeline Line Chart */}
          <motion.div variants={item}>
            <Card className="bg-beige-50 border-beige-200">
              <CardHeader>
                <CardTitle>Emotion Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareEmotionTimeline()}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Object.keys(EMOTION_COLORS).map(emotion => (
                        <Line
                          key={emotion}
                          type="monotone"
                          dataKey={emotion}
                          stroke={EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Session Comparison Bar Chart */}
          <motion.div variants={item}>
            <Card className="bg-beige-50 border-beige-200">
              <CardHeader>
                <CardTitle>Voice vs. Text Therapy Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareSessionComparison()}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="emotion" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="voice" fill="#8884d8" name="Voice Therapy" />
                      <Bar dataKey="text" fill="#82ca9d" name="Text Therapy" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={item} className="text-center text-beige-500 text-sm italic mt-8">
            <p>
              This data represents your emotional patterns tracked across therapy sessions.
              <br />
              Continue using the therapy features to generate more accurate insights.
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}