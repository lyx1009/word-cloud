import { STOP_WORDS } from '../constants';
import { WordData } from '../types';

export const processText = (
  text: string, 
  excludeStopWords: boolean = true, 
  customExclusions?: Set<string>
): WordData[] => {
  if (!text) return [];

  // Use Intl.Segmenter for Chinese word segmentation
  // Cast Intl to any to avoid TS error if lib is not configured for ES2022
  const segmenter = new (Intl as any).Segmenter('zh-CN', { granularity: 'word' });
  const segments = segmenter.segment(text);
  
  const frequencyMap = new Map<string, number>();

  for (const segment of segments) {
    const word = segment.segment.trim();
    
    // Basic filtering: remove empty strings
    if (!word) continue;
    
    // Filter out numbers and single punctuation marks if they slipped through
    if (/^[\d\s\p{P}]+$/u.test(word)) continue;

    // Filter single characters often meaningless in isolation for word clouds (optional heuristics)
    // Keeping it simple: Allow length > 1 OR strong meaningful singles (not handled here)
    if (word.length < 2 && /[\u4e00-\u9fa5]/.test(word) === false) continue; // Skip single non-chinese chars

    if (excludeStopWords && STOP_WORDS.has(word)) {
      continue;
    }

    if (customExclusions && customExclusions.has(word)) {
      continue;
    }

    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
  }

  // Convert to array and sort
  const sortedWords = Array.from(frequencyMap.entries())
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value);

  // Return top 150 words to avoid overcrowding
  return sortedWords.slice(0, 150);
};

export const parseFileText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};