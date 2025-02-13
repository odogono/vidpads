'use client';

import { createContext } from 'react';

import { SettingsStoreType } from './store';

export interface SettingsContextType {
  store: SettingsStoreType;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);
