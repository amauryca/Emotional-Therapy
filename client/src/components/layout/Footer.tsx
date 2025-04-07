import { Lock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-beige-200 py-4 mt-6">
      <div className="container mx-auto px-4 text-center text-beige-600 text-sm">
        <p>&copy; {currentYear} Therapeutic AI Assistant. All rights reserved.</p>
        <p className="mt-2">
          This application uses artificial intelligence for conversational therapy. 
          It is not a replacement for professional mental health services.
        </p>
        <div className="flex items-center justify-center mt-3 text-xs">
          <Lock className="h-3 w-3 mr-1" />
          <span>All conversations are encrypted and not stored permanently.</span>
        </div>
      </div>
    </footer>
  );
}
