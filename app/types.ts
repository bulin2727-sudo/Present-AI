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
  weight: number;
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
  score: number;
  feedback: string;
}

export interface GradingResult {
  totalScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  criteriaBreakdown: CriteriaResult[];
}