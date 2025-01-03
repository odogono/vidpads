export const OperationType = {
  Source: 'source',
  Resize: 'resize',
  Trim: 'trim',
  AddEffect: 'addEffect',
  AddTransition: 'addTransition'
} as const;

export type OperationType = (typeof OperationType)[keyof typeof OperationType];

export interface Operation {
  type: OperationType;
  url: string;
}

export interface SourceOperation extends Operation {
  type: typeof OperationType.Source;
}

export interface Recipe {
  source?: SourceOperation | undefined;
  operations: Operation[];
}

export interface Pad {
  id: string;
  recipe: Recipe;
}
