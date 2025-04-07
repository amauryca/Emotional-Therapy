import { TherapyMessage as TherapyMessageType } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

interface TherapyMessageProps {
  message: TherapyMessageType;
  isMobile?: boolean;
}

export default function TherapyMessage({ message, isMobile = false }: TherapyMessageProps) {
  const isUser = message.role === 'user';
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });
  
  // Format message content with line breaks
  const formattedContent = message.content.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < message.content.split('\n').length - 1 && <br />}
    </span>
  ));

  return (
    <div className={cn(
      "flex items-start mb-1 md:mb-2 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "rounded-lg py-1.5 px-2.5 md:py-2 md:px-3 max-w-[85%] md:max-w-[75%] shadow-sm",
        isUser 
          ? "bg-primary/20 text-primary-foreground border border-primary/10" 
          : "bg-secondary/20 border border-secondary/10"
      )}>
        <p className={cn(
          "break-words",
          isMobile ? "text-sm" : "text-base" 
        )}>
          {formattedContent}
        </p>
        
        {/* Timestamp - visible on hover or mobile touch */}
        <div className="mt-1 text-[10px] opacity-50 md:opacity-0 md:group-hover:opacity-50 transition-opacity">
          {timeAgo}
        </div>
      </div>
    </div>
  );
}
