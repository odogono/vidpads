import { ReactNode, useCallback, useEffect, useRef } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { KeyboardContext } from './context';

const KEY_PAD_MAP = {
  Digit1: 'a1',
  Digit2: 'a2',
  Digit3: 'a3',
  Digit4: 'a4',
  KeyQ: 'a5',
  KeyW: 'a6',
  KeyE: 'a7',
  KeyR: 'a8',
  KeyA: 'a9',
  KeyS: 'a10',
  KeyD: 'a11',
  KeyF: 'a12',
  KeyZ: 'a13',
  KeyX: 'a14',
  KeyC: 'a15',
  KeyV: 'a16'
};

const log = createLog('keyboard');

export const KeyboardProvider = ({ children }: { children: ReactNode }) => {
  const events = useEvents();
  const activeKeys = useRef<Set<string>>(new Set());

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const { code } = e;

      if (activeKeys.current.has(code)) return;

      log.debug('keydown', code);

      activeKeys.current.add(code);

      const padId = KEY_PAD_MAP[code as keyof typeof KEY_PAD_MAP];
      if (padId) {
        events.emit('pad:touchdown', { padId });
      }
    },
    [events]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const { code } = e;

      if (!activeKeys.current.has(code)) return;

      activeKeys.current.delete(code);

      const padId = KEY_PAD_MAP[code as keyof typeof KEY_PAD_MAP];
      if (padId) {
        events.emit('pad:touchup', { padId });
      }
    },
    [events]
  );

  const isKeyDown = (key: string) => activeKeys.current.has(key);
  const isKeyUp = (key: string) => !activeKeys.current.has(key);
  const isShiftKeyDown = () =>
    isKeyDown('ShiftLeft') || isKeyDown('ShiftRight');
  const isShiftKeyUp = () => isKeyUp('ShiftLeft') || isKeyUp('ShiftRight');

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <KeyboardContext.Provider
      value={{
        activeKeys: activeKeys.current,
        isKeyDown,
        isKeyUp,
        isShiftKeyDown,
        isShiftKeyUp
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
};
