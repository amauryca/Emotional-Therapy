import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AreaChart, 
  Area,
} from 'recharts';
import { Link } from 'wouter';
import { ArrowLeft, RefreshCw, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEmotionHistory } from '@/lib/faceApiLoader';
import { getVocalToneHistory } from '@/lib/speechEmotionRecognition';
import { Emotion, VocalTone, TherapyMessage } from '@/types';
import { usePuterAI } from '@/hooks/usePuterAI';

// Dynamic and vibrant emotion colors
const EMOTION_COLORS = {
  happy: '#4CAF50',    // Green
  sad: '#5C6BC0',      // Blue-purple
  angry: '#FF5252',    // Bright red
  surprised: '#FFD740', // Amber
  fearful: '#AB47BC',  // Purple
  disgusted: '#8D6E63', // Brown
  neutral: '#90A4AE',  // Blue-gray
  calm: '#26C6DA'      // Cyan
};

// Vocal tone colors with better contrast
const TONE_COLORS = {
  excited: '#FF9800',  // Orange
  sad: '#5C6BC0',      // Blue-purple
  angry: '#FF5252',    // Bright red
  anxious: '#7E57C2',  // Deep purple
  neutral: '#90A4AE',  // Blue-gray
  calm: '#26C6DA',     // Cyan
  uncertain: '#78909C' // Darker blue-gray
};

// Enhanced data structure with session type
interface EmotionData {
  timestamp: Date;
  emotion: string;
  intensity: number;
  session: 'voice' | 'text';
  source?: 'face' | 'vocal' | 'text'; // Track detection source
}

// Animation variants for elements with spring physics
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.15,
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.1,
      staggerDirection: -1,
      duration: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      damping: 15, 
      stiffness: 200 
    }
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Animation for chart elements
const chartAnimVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      damping: 15,
      delay: 0.2
    }
  }
};

export default function StatsPage() {
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all'|'voice'|'text'>('all'); // For filtering data
  const [chartType, setChartType] = useState<'distribution'|'timeline'|'comparison'>('distribution');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use puterAI hook to access the latest session messages for statistics
  const { messages: textMessages } = usePuterAI({});
  
  // Load emotion data from all available sources
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Get real-time emotion data from face and voice detection
        const faceEmotions = getEmotionHistory();
        const voiceTones = getVocalToneHistory();
        
        // Try to load stored data from localStorage
        const storedData = localStorage.getItem('emotionStats');
        let parsedStoredData: EmotionData[] = [];
        
        if (storedData) {
          // Convert string timestamps back to Date objects
          parsedStoredData = JSON.parse(storedData).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
        }
        
        // Convert facial emotion data to our format
        const faceData: EmotionData[] = faceEmotions.map(item => ({
          timestamp: item.timestamp,
          emotion: item.emotion,
          intensity: Math.round(item.confidence * 100),
          session: 'voice', 
          source: 'face'
        }));
        
        // Convert vocal tone data to our format
        const vocaltoneData: EmotionData[] = voiceTones.map(item => ({
          timestamp: item.timestamp,
          emotion: mapVocalToneToEmotion(item.tone),
          intensity: Math.round(item.confidence * 100),
          session: 'voice',
          source: 'vocal'
        }));
        
        // Extract emotion data from text messages
        const textData: EmotionData[] = extractTextEmotionData(textMessages);
        
        // Combine all data sources
        let combinedData = [
          ...faceData, 
          ...vocaltoneData, 
          ...textData,
          ...parsedStoredData
        ];
        
        // If very little real data, add fallback data for demonstration
        if (combinedData.length < 5) {
          // Create fallback data only for empty datasets
          const fallbackData = createFallbackData();
          combinedData = [...combinedData, ...fallbackData];
        }
        
        // Sort by timestamp
        combinedData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        if (combinedData.length > 0) {
          setEmotionData(combinedData);
          
          // Save combined data to localStorage
          localStorage.setItem('emotionStats', JSON.stringify(combinedData));
        } else {
          setEmotionData([]);
        }
      } catch (error) {
        console.error('Error loading emotion data:', error);
        
        // Try to load from localStorage as fallback
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
    
    // Refresh data every 15 seconds
    const refreshInterval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 15000);
    
    return () => clearInterval(refreshInterval);
  }, [textMessages, refreshTrigger]);
  
  // Extract emotion data from text therapy messages
  const extractTextEmotionData = (messages: TherapyMessage[]): EmotionData[] => {
    return messages
      .filter(msg => msg.role === 'user' && msg.mood?.emotion)
      .map(msg => ({
        timestamp: new Date(msg.timestamp),
        emotion: msg.mood?.emotion || 'neutral',
        intensity: 75, // Default intensity
        session: 'text',
        source: 'text'
      }));
  };
  
  // Create fallback data - for demo purposes 
  const createFallbackData = (): EmotionData[] => {
    const now = new Date();
    return [
      // Recent voice therapy data
      { 
        timestamp: new Date(now.getTime() - 30 * 60 * 1000), 
        emotion: 'happy',
        intensity: 85, 
        session: 'voice',
        source: 'face'
      },
      { 
        timestamp: new Date(now.getTime() - 25 * 60 * 1000), 
        emotion: 'neutral',
        intensity: 70, 
        session: 'voice',
        source: 'vocal'
      },
      
      // Recent text therapy data
      { 
        timestamp: new Date(now.getTime() - 20 * 60 * 1000), 
        emotion: 'sad',
        intensity: 80, 
        session: 'text',
        source: 'text'
      },
      { 
        timestamp: new Date(now.getTime() - 15 * 60 * 1000), 
        emotion: 'neutral',
        intensity: 70, 
        session: 'text',
        source: 'text'
      }
    ];
  };
  
  // Map vocal tones to corresponding emotions
  const mapVocalToneToEmotion = (tone: VocalTone): Emotion => {
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
  
  // Reset all tracked emotion data
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all emotion tracking data?')) {
      localStorage.removeItem('emotionStats');
      setEmotionData([]);
    }
  };
  
  // Get filtered data based on active tab
  const getFilteredData = (): EmotionData[] => {
    if (activeTab === 'all') return emotionData;
    return emotionData.filter(data => data.session === activeTab);
  };
  
  // ----- DATA PREPARATION FOR CHARTS -----
  
  // Emotion distribution for pie chart
  const prepareEmotionDistribution = () => {
    const filteredData = getFilteredData();
    const emotionCounts: {[key: string]: number} = {};
    
    filteredData.forEach(data => {
      emotionCounts[data.emotion] = (emotionCounts[data.emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        name: emotion,
        value: count
      }))
      .sort((a, b) => b.value - a.value); // Sort by frequency
  };
  
  // Emotion timeline data for line chart - grouped by date and hour
  const prepareEmotionTimeline = () => {
    const filteredData = getFilteredData();
    const timeGroups: {[key: string]: {[key: string]: number}} = {};
    
    filteredData.forEach(data => {
      // Format: "MM/DD HH:00"
      const timeKey = `${data.timestamp.getMonth()+1}/${data.timestamp.getDate()} ${data.timestamp.getHours()}:00`;
      
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = {};
      }
      
      timeGroups[timeKey][data.emotion] = (timeGroups[timeKey][data.emotion] || 0) + 1;
    });
    
    // Convert to array format for chart
    return Object.entries(timeGroups)
      .map(([time, emotions]) => ({
        time,
        ...emotions
      }))
      .sort((a, b) => {
        // Sort by time
        const timeA = new Date(a.time.replace(' ', '/2025 ')).getTime();
        const timeB = new Date(b.time.replace(' ', '/2025 ')).getTime();
        return timeA - timeB;
      });
  };
  
  // Voice vs Text therapy comparison
  const prepareSessionComparison = () => {
    // Create placeholder for all emotions in both session types
    const emotionTypes = Object.keys(EMOTION_COLORS);
    const sessions = {
      voice: Object.fromEntries(emotionTypes.map(e => [e, 0])),
      text: Object.fromEntries(emotionTypes.map(e => [e, 0]))
    };
    
    // Count emotions by session type
    emotionData.forEach(data => {
      if (sessions[data.session] && data.emotion in sessions[data.session]) {
        // @ts-ignore - Dynamic property access
        sessions[data.session][data.emotion]++;
      }
    });
    
    // Format data for bar chart
    return emotionTypes
      .filter(emotion => 
        sessions.voice[emotion as keyof typeof sessions.voice] > 0 || 
        sessions.text[emotion as keyof typeof sessions.text] > 0
      )
      .map(emotion => ({
        emotion,
        voice: sessions.voice[emotion as keyof typeof sessions.voice],
        text: sessions.text[emotion as keyof typeof sessions.text]
      }));
  };
  
  // Emotion intensity over time (area chart)
  const prepareEmotionIntensity = () => {
    const filteredData = getFilteredData();
    const timeGroups: {[key: string]: {[key: string]: number[]}} = {};
    
    filteredData.forEach(data => {
      // Group by hour
      const timeKey = `${data.timestamp.getMonth()+1}/${data.timestamp.getDate()} ${data.timestamp.getHours()}:00`;
      
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = {};
      }
      
      if (!timeGroups[timeKey][data.emotion]) {
        timeGroups[timeKey][data.emotion] = [];
      }
      
      timeGroups[timeKey][data.emotion].push(data.intensity);
    });
    
    // Calculate average intensity for each emotion per time period
    return Object.entries(timeGroups).map(([time, emotions]) => {
      const result: any = { time };
      
      Object.entries(emotions).forEach(([emotion, intensities]) => {
        const avg = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
        result[emotion] = Math.round(avg);
      });
      
      return result;
    }).sort((a, b) => {
      // Sort by time
      const timeA = new Date(a.time.replace(' ', '/2025 ')).getTime();
      const timeB = new Date(b.time.replace(' ', '/2025 ')).getTime();
      return timeA - timeB;
    });
  };
  
  // Custom tooltip formatter
  const customTooltipFormatter = (value: number, name: string) => {
    // Capitalize emotion name and format the value
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    return [value, formattedName];
  };
  
  // Loading state with animation
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <motion.div 
          className="flex flex-col items-center justify-center h-[50vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <RefreshCw className="animate-spin h-12 w-12 text-blue-500 mb-4" />
          <p className="text-blue-700 text-lg animate-pulse">Loading your emotion statistics...</p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="outline" className="mr-4 border-blue-200 text-blue-600 hover:bg-blue-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Emotion Analytics
            </h1>
          </div>
          
          <Button 
            variant="outline" 
            className="text-red-500 border-red-200 hover:bg-red-50 shadow-sm"
            onClick={handleClearData}
          >
            Clear All Data
          </Button>
        </div>
        
        <p className="text-gray-600 max-w-3xl">
          Track your emotional patterns during therapy sessions to gain insights into your emotional well-being.
        </p>
      </motion.div>
      
      {emotionData.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-blue-50 border-blue-200 shadow-md text-center py-12">
            <CardContent>
              <p className="text-blue-600 mb-4 text-lg">No emotion data available yet.</p>
              <p className="text-blue-500 mb-6">
                Use the voice or text therapy features to start tracking your emotions.
              </p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Return to Therapy
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Session Type Filter */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-2">Filter by Session Type</h2>
                <Tabs defaultValue="all" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                  <TabsList className="bg-gray-100">
                    <TabsTrigger 
                      value="all"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      All Sessions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="voice"
                      className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
                    >
                      Voice Therapy
                    </TabsTrigger>
                    <TabsTrigger 
                      value="text"
                      className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                    >
                      Text Therapy
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-2">Chart Type</h2>
                <div className="flex space-x-2">
                  <Button 
                    variant={chartType === 'distribution' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('distribution')}
                    className={chartType === 'distribution' ? 'bg-purple-500' : ''}
                  >
                    <PieChartIcon className="h-4 w-4 mr-1" />
                    Distribution
                  </Button>
                  <Button 
                    variant={chartType === 'timeline' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('timeline')}
                    className={chartType === 'timeline' ? 'bg-blue-500' : ''}
                  >
                    <LineChartIcon className="h-4 w-4 mr-1" />
                    Timeline
                  </Button>
                  <Button 
                    variant={chartType === 'comparison' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('comparison')}
                    className={chartType === 'comparison' ? 'bg-green-500' : ''}
                  >
                    <BarChart2 className="h-4 w-4 mr-1" />
                    Compare
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Chart display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${chartType}`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={chartAnimVariants}
              transition={{ duration: 0.2 }}
            >
              {chartType === 'distribution' && (
                <Card className="overflow-hidden bg-white border-gray-200 shadow-md">
                  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardTitle className="text-gray-800">
                      Emotion Distribution
                      {activeTab !== 'all' && ` - ${activeTab === 'voice' ? 'Voice' : 'Text'} Therapy`}
                    </CardTitle>
                    <CardDescription>
                      Frequency of each emotion detected during your therapy sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareEmotionDistribution()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => 
                              `${name.charAt(0).toUpperCase() + name.slice(1)} (${(percent * 100).toFixed(0)}%)`
                            }
                            outerRadius={150}
                            innerRadius={60}
                            paddingAngle={3}
                            fill="#8884d8"
                            dataKey="value"
                            animationBegin={200}
                            animationDuration={1500}
                          >
                            {prepareEmotionDistribution().map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={EMOTION_COLORS[entry.name as keyof typeof EMOTION_COLORS] || '#999999'} 
                                stroke="#fff"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={customTooltipFormatter}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              borderRadius: '8px', 
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              border: 'none'
                            }}
                          />
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {chartType === 'timeline' && (
                <Card className="overflow-hidden bg-white border-gray-200 shadow-md">
                  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-gray-800">
                      Emotion Timeline
                      {activeTab !== 'all' && ` - ${activeTab === 'voice' ? 'Voice' : 'Text'} Therapy`}
                    </CardTitle>
                    <CardDescription>
                      Emotional patterns over time during your therapy sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={prepareEmotionIntensity()}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 20,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                          <YAxis 
                            label={{ 
                              value: 'Intensity', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { textAnchor: 'middle', fill: '#666' }
                            }} 
                          />
                          <Tooltip 
                            formatter={customTooltipFormatter}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              borderRadius: '8px', 
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              border: 'none'
                            }}
                          />
                          <Legend 
                            layout="horizontal"
                            verticalAlign="top"
                            align="center"
                            wrapperStyle={{ paddingBottom: '20px' }}
                          />
                          {/* Only show the top 5 most frequent emotions */}
                          {Object.keys(EMOTION_COLORS)
                            .filter(emotion => {
                              // Check if emotion appears in the data
                              return prepareEmotionIntensity().some(item => item[emotion] !== undefined);
                            })
                            .slice(0, 5) // Top 5 emotions only
                            .map((emotion, index) => (
                              <Area
                                key={emotion}
                                type="monotone"
                                dataKey={emotion}
                                stackId="1"
                                stroke={EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]}
                                fill={`${EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]}50`}
                                animationBegin={200 + index * 100}
                                animationDuration={1500}
                              />
                            ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {chartType === 'comparison' && (
                <Card className="overflow-hidden bg-white border-gray-200 shadow-md">
                  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
                    <CardTitle className="text-gray-800">Voice vs. Text Therapy Comparison</CardTitle>
                    <CardDescription>
                      Compare emotional patterns between voice and text therapy sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prepareSessionComparison()}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 20,
                            bottom: 20,
                          }}
                          barGap={8}
                          barCategoryGap={20}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis 
                            dataKey="emotion" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                          />
                          <YAxis 
                            label={{ 
                              value: 'Frequency', 
                              angle: -90, 
                              position: 'insideLeft',
                              style: { textAnchor: 'middle', fill: '#666' }
                            }}
                          />
                          <Tooltip 
                            formatter={customTooltipFormatter}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              borderRadius: '8px', 
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              border: 'none'
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="voice" 
                            name="Voice Therapy" 
                            fill="#5C6BC0" 
                            radius={[4, 4, 0, 0]} 
                            animationBegin={200}
                            animationDuration={1500}
                          />
                          <Bar 
                            dataKey="text" 
                            name="Text Therapy" 
                            fill="#43A047" 
                            radius={[4, 4, 0, 0]} 
                            animationBegin={400}
                            animationDuration={1500}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Insights section */}
          <motion.div 
            variants={itemVariants}
            className="mt-8"
          >
            <Card className="overflow-hidden bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-indigo-800">Therapy Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-indigo-700 mb-3">
                  Your most frequent emotions:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {prepareEmotionDistribution()
                    .slice(0, 3) // Top 3 emotions
                    .map((emotion, idx) => (
                      <motion.div 
                        key={emotion.name}
                        className="bg-white px-3 py-2 rounded-full shadow-sm border border-indigo-100 flex items-center"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          delay: idx * 0.1 + 0.5,
                          type: "spring",
                          stiffness: 400, 
                          damping: 15
                        }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ 
                            backgroundColor: EMOTION_COLORS[emotion.name as keyof typeof EMOTION_COLORS] || '#999'
                          }}
                        ></div>
                        <span className="capitalize font-medium text-gray-800">
                          {emotion.name}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({emotion.value} occurrences)
                        </span>
                      </motion.div>
                    ))}
                </div>
                
                <p className="text-indigo-600 text-sm">
                  Continue using both voice and text therapy sessions to build a more complete 
                  emotional profile and track your progression over time.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
      
      <motion.div 
        className="mt-8 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Link href="/">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Return to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}