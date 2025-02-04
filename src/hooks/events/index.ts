'use client';

import { useContext } from 'react';

import { EventsContext } from './context';

export const useEvents = () => {
  const events = useContext(EventsContext);
  if (!events) throw new Error('EventsProvider not found');
  return events;
};
