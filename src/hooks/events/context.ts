import { createContext } from 'react';

import { EventEmitter } from './provider';

export const EventsContext = createContext<EventEmitter | null>(null);
