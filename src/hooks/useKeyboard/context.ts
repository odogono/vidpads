'use client';

import { createContext } from 'react';

export interface KeyboardContextType {
  // activeKeys: Set<string>;
  // isKeyDown: (key: string) => boolean;
  // isKeyUp: (key: string) => boolean;
  isShiftKeyDown: () => boolean;
  isShiftKeyUp: () => boolean;
  isAltKeyDown: () => boolean;
  isAltKeyUp: () => boolean;
  isCtrlKeyDown: () => boolean;
  isCtrlKeyUp: () => boolean;
  isMetaKeyDown: () => boolean;
  isMetaKeyUp: () => boolean;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
}

export const KeyboardContext = createContext<KeyboardContextType | undefined>(
  undefined
);
