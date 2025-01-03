import { createContext } from 'react';

import type { StoreType } from './types';

export const StoreContext = createContext<StoreType | null>(null);
