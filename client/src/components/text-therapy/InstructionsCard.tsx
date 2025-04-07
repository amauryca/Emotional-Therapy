import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { THERAPY_INSTRUCTIONS, PRIVACY_NOTE } from '@/lib/constants';
import { Lock } from 'lucide-react';

export default function InstructionsCard() {
  return (
    <Card className="bg-beige-100 max-w-4xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="text-beige-700">How to use Text Therapy</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside space-y-2 text-beige-600">
          {THERAPY_INSTRUCTIONS.text.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
        
        <div className="mt-4 p-3 bg-beige-200/50 rounded-lg text-beige-600 text-sm">
          <p className="flex items-center">
            <Lock className="h-3 w-3 mr-1" />
            <strong className="mr-1">Privacy Note:</strong> 
            {PRIVACY_NOTE}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
