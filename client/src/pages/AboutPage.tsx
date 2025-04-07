import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Heart, Shield, Brain, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-beige-100 mb-6">
          <CardHeader>
            <CardTitle className="text-beige-700 text-2xl">About Therapeutic AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-medium text-beige-700 mb-3 flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                Our Mission
              </h2>
              <p className="text-beige-600">
                Therapeutic AI was created to provide accessible mental health support through 
                innovative AI technology. Our platform combines cutting-edge emotion recognition 
                with compassionate therapeutic responses, offering a safe space for users to 
                express themselves and receive personalized guidance.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-medium text-beige-700 mb-3 flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                How It Works
              </h2>
              <p className="text-beige-600 mb-4">
                Our AI therapeutic system uses multiple inputs to understand your emotional state:
              </p>
              <ul className="list-disc list-inside space-y-2 text-beige-600 ml-4">
                <li>Facial expression analysis through your camera</li>
                <li>Vocal tone detection when you speak</li>
                <li>Text content analysis from your messages</li>
                <li>Contextual understanding of conversation history</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-medium text-beige-700 mb-3 flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                Personalized Experience
              </h2>
              <p className="text-beige-600">
                We believe in meeting users where they are. Our platform adapts its communication 
                style based on your age group and emotional state, providing responses that are 
                appropriate, supportive, and helpful. Whether you're a child, teenager, or adult, 
                our AI adjusts its language complexity and therapeutic approach to best serve you.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-medium text-beige-700 mb-3 flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Privacy & Ethics
              </h2>
              <p className="text-beige-600">
                Your privacy is our priority. All conversations are processed locally in your browser 
                and are not stored on our servers after your session ends. We do not share your data 
                with third parties, and our emotion detection technology is designed with ethics 
                and user dignity at its core.
              </p>
              <p className="text-beige-600 mt-3">
                <strong>Important Note:</strong> While our AI provides therapeutic-style interactions, 
                it is not a replacement for professional mental health services. If you're experiencing 
                a crisis or need immediate help, please contact a licensed mental health professional.
              </p>
            </section>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}