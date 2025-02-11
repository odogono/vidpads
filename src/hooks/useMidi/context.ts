'use client';

import { createContext } from 'react';

import { MidiStoreType } from './store';

export interface MidiContextType {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  store: MidiStoreType;
}

export const MidiContext = createContext<MidiContextType | undefined>(
  undefined
);
