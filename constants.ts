import { Rubric } from './types';

export const DEFAULT_RUBRICS: Rubric[] = [
  {
    id: 'general',
    name: 'General Presentation',
    description: 'Standard evaluation for clarity, content, and engagement.',
    criteria: [
      { id: 'clarity', name: 'Clarity & Articulation', description: 'Speaker speaks clearly, proper volume, and good pacing.', weight: 25 },
      { id: 'content', name: 'Content Structure', description: 'Logical flow, clear introduction, body, and conclusion.', weight: 35 },
      { id: 'engagement', name: 'Engagement & Tone', description: 'Maintains audience interest, uses appropriate tone.', weight: 20 },
      { id: 'vocabulary', name: 'Vocabulary & Grammar', description: 'Correct usage of language and domain-specific terms.', weight: 20 },
    ]
  },
  {
    id: 'persuasive',
    name: 'Persuasive Speech',
    description: 'Focused on arguments, evidence, and call to action.',
    criteria: [
      { id: 'argument', name: 'Argument Strength', description: 'Clear claims backed by strong evidence.', weight: 40 },
      { id: 'rhetoric', name: 'Rhetorical Devices', description: 'Effective use of pathos, ethos, and logos.', weight: 30 },
      { id: 'delivery', name: 'Passionate Delivery', description: 'Convincing and confident delivery style.', weight: 30 },
    ]
  },
  {
    id: 'technical',
    name: 'Technical Demo',
    description: 'Evaluation for technical accuracy and explanation of complex concepts.',
    criteria: [
      { id: 'accuracy', name: 'Technical Accuracy', description: 'Correctness of facts and technical details.', weight: 40 },
      { id: 'simplicity', name: 'Simplification', description: 'Ability to explain complex topics simply.', weight: 30 },
      { id: 'flow', name: 'Demo Flow', description: 'Smooth transition between steps or slides.', weight: 30 },
    ]
  }
];
