import { useState } from 'react';
import { LANGUAGE_COMPLEXITY_LEVELS } from '@/lib/constants';

export type AgeGroup = 'children' | 'teenagers' | 'adults';

interface UseLanguageComplexityProps {
  defaultAgeGroup?: AgeGroup;
}

export function useLanguageComplexity({ defaultAgeGroup = 'adults' }: UseLanguageComplexityProps = {}) {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(defaultAgeGroup);
  
  // Get the complexity level based on age group
  const getComplexityLevel = (): number => {
    switch (ageGroup) {
      case 'children':
        return 0; // Simple
      case 'teenagers':
        return 1; // Moderate
      case 'adults':
      default:
        return 2; // Advanced
    }
  };
  
  // Get language instructions based on complexity level
  const getLanguageInstructions = (): string => {
    const level = getComplexityLevel();
    return LANGUAGE_COMPLEXITY_LEVELS[level].instructions;
  };
  
  // Get language examples based on complexity level
  const getLanguageExamples = (): string => {
    const level = getComplexityLevel();
    return LANGUAGE_COMPLEXITY_LEVELS[level].examples;
  };
  
  // Get a therapeutic response prompt that incorporates the selected language complexity
  const getTherapeuticPrompt = (
    userMessage: string, 
    detectedEmotion?: string, 
    vocalTone?: string
  ): string => {
    const complexityLevel = getComplexityLevel();
    const complexityInstructions = LANGUAGE_COMPLEXITY_LEVELS[complexityLevel].instructions;
    const examples = LANGUAGE_COMPLEXITY_LEVELS[complexityLevel].examples;
    
    let emotionContext = '';
    if (detectedEmotion) {
      emotionContext += `The user appears to be feeling ${detectedEmotion}. `;
    }
    
    if (vocalTone) {
      emotionContext += `Their tone of voice suggests they are ${vocalTone}. `;
    }
    
    return `
      You are a compassionate AI therapist having a conversation with someone. 
      ${emotionContext}
      
      The person has said: "${userMessage}"
      
      ${complexityInstructions}
      
      Examples of this language level:
      ${examples}
      
      Respond with empathy, therapeutic insight, and in a way that's appropriate for their emotional state, 
      while maintaining the specified language complexity level.
    `;
  };
  
  return {
    ageGroup,
    setAgeGroup,
    getComplexityLevel,
    getLanguageInstructions,
    getLanguageExamples,
    getTherapeuticPrompt,
  };
}