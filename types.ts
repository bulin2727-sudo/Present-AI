export enum AppState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100
}

export interface Rubric {
  id: string;
  name: string;
  description: string;
  criteria: RubricCriteria[];
}

export interface CriteriaResult {
  criteriaId: string;
  name: string;
  score: number; // 0-10
  feedback: string;
}

export interface GradingResult {
  totalScore: number; // 0-100
  summary: string;
  strengths: string[];
  improvements: string[];
  criteriaBreakdown: CriteriaResult[];
}

export interface AudioVisualizerData {
  values: number[];
}
