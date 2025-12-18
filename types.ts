export interface WordData {
  text: string;
  value: number; // Frequency or score
}

export interface SentimentData {
  label: string;
  score: number; // 0 to 100
  color: string;
  explanation: string;
}

export interface AnalysisResult {
  keywords: WordData[];
  sentiment: SentimentData[];
  overallTone: string;
}

export interface CloudConfig {
  fontFamily: string;
  rotationAngles: [number, number]; // [min, max]
  rotations: number; // number of orientation steps
  scale: 'linear' | 'log' | 'sqrt';
  spiral: 'archimedean' | 'rectangular';
  padding: number;
}

export enum AnalysisMode {
  LOCAL = 'LOCAL', // Browser-based segmentation
  AI = 'AI' // Gemini-based extraction
}

export interface ChartData {
  name: string;
  count: number;
}
