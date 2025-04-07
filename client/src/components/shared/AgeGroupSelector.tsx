import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AgeGroup } from '@/hooks/useLanguageComplexity';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Baby, School, User } from 'lucide-react';

interface AgeGroupSelectorProps {
  currentAgeGroup: AgeGroup;
  onAgeGroupChange: (ageGroup: AgeGroup) => void;
  label?: string;
  className?: string;
}

export default function AgeGroupSelector({
  currentAgeGroup,
  onAgeGroupChange,
  label = "Language Level",
  className = ""
}: AgeGroupSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const getAgeGroupLabel = (ageGroup: AgeGroup): string => {
    switch (ageGroup) {
      case 'children':
        return 'Children (5-12)';
      case 'teenagers':
        return 'Teenagers (13-17)';
      case 'adults':
        return 'Adults (18+)';
      default:
        return 'Adults (18+)';
    }
  };
  
  const getAgeGroupIcon = (ageGroup: AgeGroup) => {
    switch (ageGroup) {
      case 'children':
        return <Baby className="h-4 w-4 mr-2" />;
      case 'teenagers':
        return <School className="h-4 w-4 mr-2" />;
      case 'adults':
        return <User className="h-4 w-4 mr-2" />;
      default:
        return <User className="h-4 w-4 mr-2" />;
    }
  };
  
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-xs text-beige-500 mb-1">{label}</label>}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="justify-between bg-beige-100 border-beige-300 text-beige-700 h-9 opacity-100"
          >
            <span className="flex items-center">
              {getAgeGroupIcon(currentAgeGroup)}
              {getAgeGroupLabel(currentAgeGroup)}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-beige-100 border-beige-300 opacity-100">
          <DropdownMenuItem
            className="flex cursor-pointer items-center"
            onClick={() => {
              onAgeGroupChange('children');
              setOpen(false);
            }}
          >
            <Baby className="h-4 w-4 mr-2" />
            Children (5-12)
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex cursor-pointer items-center"
            onClick={() => {
              onAgeGroupChange('teenagers');
              setOpen(false);
            }}
          >
            <School className="h-4 w-4 mr-2" />
            Teenagers (13-17)
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex cursor-pointer items-center"
            onClick={() => {
              onAgeGroupChange('adults');
              setOpen(false);
            }}
          >
            <User className="h-4 w-4 mr-2" />
            Adults (18+)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}