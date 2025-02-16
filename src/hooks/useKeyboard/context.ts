'use client';

import { createContext } from 'react';

import { EventMap } from './types';

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
  resetKeyMap: () => void;
  keyMap: EventMap;
}

export const KeyboardContext = createContext<KeyboardContextType | undefined>(
  undefined
);
