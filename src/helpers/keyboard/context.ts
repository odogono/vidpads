'use client';

import { createContext } from 'react';

export interface KeyboardContextType {
  activeKeys: Set<string>;
  isKeyDown: (key: string) => boolean;
  isKeyUp: (key: string) => boolean;
  isShiftKeyDown: () => boolean;
  isShiftKeyUp: () => boolean;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
}

export const KeyboardContext = createContext<KeyboardContextType | undefined>(
  undefined
);
