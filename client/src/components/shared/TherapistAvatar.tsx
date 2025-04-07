import { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Emotion } from '@/types';
import { UserRound, User2, Coffee } from 'lucide-react';

type AvatarStyle = 'professional' | 'friendly' | 'casual';

interface TherapistAvatarProps {
  emotion?: Emotion;
  speaking?: boolean;
  style?: AvatarStyle;
  onStyleChange?: (style: AvatarStyle) => void;
}

export default function TherapistAvatar({ 
  emotion = 'neutral', 
  speaking = false,
  style = 'professional',
  onStyleChange
}: TherapistAvatarProps) {
  const [avatarSrc, setAvatarSrc] = useState<string>('');
  
  // Update avatar based on emotion and speaking state
  useEffect(() => {
    // Each animation would be represented by a Lottie JSON file
    // For now, we'll use placeholders
    let animation = '';
    
    console.log("TherapistAvatar received emotion:", emotion);
    
    // In a real implementation, you would have different Lottie animations
    // for different emotions and speaking states
    if (speaking) {
      // Even when speaking, let's vary the animation based on emotion
      switch (emotion) {
        case 'happy':
          animation = 'https://assets7.lottiefiles.com/packages/lf20_ysas4vcp.json'; // happy talking
          break;
        case 'sad':
          animation = 'https://assets7.lottiefiles.com/packages/lf20_ysas4vcp.json'; // sad talking
          break;
        default:
          animation = 'https://assets7.lottiefiles.com/packages/lf20_ysas4vcp.json'; // neutral talking
      }
    } else {
      // More distinct animations for each emotion
      switch (emotion) {
        case 'happy':
          animation = 'https://assets1.lottiefiles.com/packages/lf20_pucJMW.json'; // happy face
          break;
        case 'sad':
          animation = 'https://assets4.lottiefiles.com/packages/lf20_4fwkwg1o.json'; // sad face
          break;
        case 'surprised':
          animation = 'https://assets9.lottiefiles.com/packages/lf20_f2q4ujho.json'; // surprised
          break;
        case 'angry':
          animation = 'https://assets4.lottiefiles.com/packages/lf20_4fwkwg1o.json'; // angry face (using sad for now)
          break;
        case 'fearful':
          animation = 'https://assets9.lottiefiles.com/packages/lf20_f2q4ujho.json'; // fearful (using surprised for now)
          break;
        case 'disgusted':
          animation = 'https://assets4.lottiefiles.com/packages/lf20_4fwkwg1o.json'; // disgusted (using sad for now)
          break;
        case 'calm':
          animation = 'https://assets4.lottiefiles.com/packages/lf20_fj8rlc.json'; // calm face (using neutral for now)
          break;
        default:
          animation = 'https://assets4.lottiefiles.com/packages/lf20_fj8rlc.json'; // neutral face
      }
    }
    
    setAvatarSrc(animation);
    console.log("Set avatar animation for emotion:", emotion, "animation:", animation);
  }, [emotion, speaking]);
  
  const handleStyleChange = (value: string) => {
    if (onStyleChange) {
      onStyleChange(value as AvatarStyle);
    }
  };
  
  return (
    <Card className="bg-beige-100 overflow-hidden shadow-lg border-2 border-beige-300 transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          {/* Avatar Style Selection - Enhanced with visual buttons */}
          <div className="mb-4 w-full border-b border-beige-300 pb-3">
            <div className="flex flex-col">
              <Label className="text-sm text-beige-800 font-medium mb-2 text-center">
                Choose Therapist Style:
              </Label>
              
              <div className="flex justify-center gap-2">
                <Button
                  size="sm"
                  variant={style === 'professional' ? 'default' : 'outline'}
                  className={`flex items-center px-3 py-1 ${
                    style === 'professional' 
                      ? 'bg-beige-600 text-white' 
                      : 'bg-beige-100 text-beige-700 border-beige-300'
                  }`}
                  onClick={() => handleStyleChange('professional')}
                >
                  <UserRound className="mr-1 h-4 w-4" />
                  <span>Professional</span>
                </Button>
                
                <Button
                  size="sm"
                  variant={style === 'friendly' ? 'default' : 'outline'}
                  className={`flex items-center px-3 py-1 ${
                    style === 'friendly' 
                      ? 'bg-beige-600 text-white' 
                      : 'bg-beige-100 text-beige-700 border-beige-300'
                  }`}
                  onClick={() => handleStyleChange('friendly')}
                >
                  <User2 className="mr-1 h-4 w-4" />
                  <span>Friendly</span>
                </Button>
                
                <Button
                  size="sm"
                  variant={style === 'casual' ? 'default' : 'outline'}
                  className={`flex items-center px-3 py-1 ${
                    style === 'casual' 
                      ? 'bg-beige-600 text-white' 
                      : 'bg-beige-100 text-beige-700 border-beige-300'
                  }`}
                  onClick={() => handleStyleChange('casual')}
                >
                  <Coffee className="mr-1 h-4 w-4" />
                  <span>Casual</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Avatar Animation */}
          <div className="bg-white rounded-full overflow-hidden w-48 h-48 border-4 border-beige-300 shadow-md mx-auto mb-3">
            {avatarSrc ? (
              <Player
                autoplay
                loop
                src={avatarSrc}
                style={{ height: '100%', width: '100%' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-beige-500">
                <span>Loading...</span>
              </div>
            )}
          </div>
          
          {/* Avatar Status */}
          <div className="mt-3 text-center text-sm text-beige-700 font-medium">
            {speaking ? 
              <span className="flex items-center justify-center bg-beige-200 py-1.5 px-4 rounded-full animate-pulse shadow-sm">
                <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></span>
                Speaking...
              </span> : 
              <span className="bg-beige-200 py-1.5 px-4 rounded-full inline-block shadow-sm">Listening...</span>
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}