import { Rubric } from './types';

export const DEFAULT_RUBRICS: Rubric[] = [
  {
    id: 'general',
    name: 'General Presentation',
    description: 'Standard evaluation for clarity, content, and engagement.',
    criteria: [
      { id: 'clarity', name: 'Clarity & Articulation', description: 'Speaker speaks clearly, proper volume.', weight: 30 },
      { id: 'content', name: 'Structure', description: 'Logical flow and clear organization.', weight: 40 },
      { id: 'engagement', name: 'Engagement', description: 'Maintains audience interest.', weight: 30 },
    ]
  },
  {
    id: 'technical',
    name: 'Technical Demo',
    description: 'Evaluation for technical accuracy and explanation.',
    criteria: [
      { id: 'accuracy', name: 'Technical Accuracy', description: 'Correctness of facts.', weight: 50 },
      { id: 'simplicity', name: 'Simplicity', description: 'Ability to explain complex topics.', weight: 50 },
    ]
  }
];