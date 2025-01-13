'use client';

import { createContext } from 'react';

import type { StoreType } from './types';

export interface StoreContextType {
  store: StoreType;
  isReady: boolean;
}

export const StoreContext = createContext<StoreContextType | null>(null);
