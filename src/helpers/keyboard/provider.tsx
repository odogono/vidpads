'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { EventEmitterEvents } from '@hooks/events/types';
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

type EventMap = {
  [key: string]: {
    event: keyof EventEmitterEvents;
    // args?: unknown;
    fn?: () => void;
  };
};

const EVENT_MAP: EventMap = {
  Escape: {
    event: 'cmd:cancel',
    // eslint-disable-next-line no-console
    fn: () => console.clear()
  },
  Space: {
    event: 'seq:play-toggle'
  },
  Enter: {
    event: 'seq:rewind'
  }
};

const log = createLog('keyboard', ['debug']);

export const KeyboardProvider = ({ children }: { children: ReactNode }) => {
  const events = useEvents();
  const activeKeys = useRef<Set<string>>(new Set());
  const [isEnabled, setIsEnabled] = useState(true);

  const clearActiveKeys = useCallback(() => {
    activeKeys.current.forEach((code) => {
      const padId = KEY_PAD_MAP[code as keyof typeof KEY_PAD_MAP];
      if (padId) {
        events.emit('pad:touchup', { padId });
      }
    });

    activeKeys.current.clear();
    log.debug('[keyboard] cleared all active keys');
  }, [events]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const { code } = e;

      if (!isEnabled) {
        log.debug('[keyboard] not enabled, ignoring keydown:', code);
        return;
      }

      if (code === 'ArrowLeft') {
        events.emit('cmd:arrow', 'left');
        return;
      }

      if (code === 'ArrowRight') {
        events.emit('cmd:arrow', 'right');
        return;
      }

      if (code === 'ArrowUp') {
        events.emit('cmd:arrow', 'up');
        return;
      }

      if (code === 'ArrowDown') {
        events.emit('cmd:arrow', 'down');
        return;
      }

      if (activeKeys.current.has(code)) {
        log.debug(
          '[keyboard] keydown already active:',
          code,
          activeKeys.current
        );
        return;
      }

      activeKeys.current.add(code);

      log.debug('[keyboard] keydown:', code, e.ctrlKey, e.metaKey);

      if (e.ctrlKey || e.metaKey) {
        if (code === 'KeyC') {
          events.emit('cmd:copy');
          activeKeys.current.delete(code);
          return;
        }

        if (code === 'KeyX') {
          events.emit('cmd:cut');
          activeKeys.current.delete(code);
          return;
        }

        if (code === 'KeyV') {
          events.emit('cmd:paste');
          activeKeys.current.delete(code);
          return;
        }
      }

      const padId = KEY_PAD_MAP[code as keyof typeof KEY_PAD_MAP];
      if (padId) {
        events.emit('pad:touchdown', { padId });
        return;
      }

      if (EVENT_MAP[code]) {
        const { event, fn } = EVENT_MAP[code];
        events.emit(event);
        if (fn) fn();
        return;
      }
    },
    [events, isEnabled]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const { code } = e;

      if (!isEnabled) return;

      if (!activeKeys.current.has(code)) return;

      activeKeys.current.delete(code);

      log.debug('[keyboard] keyup:', code);

      const padId = KEY_PAD_MAP[code as keyof typeof KEY_PAD_MAP];
      if (padId) {
        events.emit('pad:touchup', { padId });
      }
    },
    [events, isEnabled]
  );

  const handleBlur = useCallback(() => {
    if (!isEnabled) return;
    clearActiveKeys();
  }, [clearActiveKeys, isEnabled]);

  const isKeyDown = (key: string) => activeKeys.current.has(key);
  const isKeyUp = (key: string) => !activeKeys.current.has(key);
  const isShiftKeyDown = () =>
    isKeyDown('ShiftLeft') || isKeyDown('ShiftRight');
  const isShiftKeyUp = () => isKeyUp('ShiftLeft') || isKeyUp('ShiftRight');

  const isAltKeyDown = () => isKeyDown('AltLeft') || isKeyDown('AltRight');
  const isAltKeyUp = () => isKeyUp('AltLeft') || isKeyUp('AltRight');
  const isCtrlKeyDown = () =>
    isKeyDown('ControlLeft') || isKeyDown('ControlRight');
  const isCtrlKeyUp = () => isKeyUp('ControlLeft') || isKeyUp('ControlRight');

  const isMetaKeyDown = () => isKeyDown('MetaLeft') || isKeyDown('MetaRight');
  const isMetaKeyUp = () => isKeyUp('MetaLeft') || isKeyUp('MetaRight');

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    events.on('keyboard:enabled', setIsEnabled);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      events.off('keyboard:enabled', setIsEnabled);
    };
  }, [handleKeyDown, handleKeyUp, handleBlur, events]);

  // log.debug('isEnabled', isEnabled);

  return (
    <KeyboardContext.Provider
      value={{
        activeKeys: activeKeys.current,
        isKeyDown,
        isKeyUp,
        isShiftKeyDown,
        isShiftKeyUp,
        isAltKeyDown,
        isAltKeyUp,
        isCtrlKeyDown,
        isCtrlKeyUp,
        isMetaKeyDown,
        isMetaKeyUp,
        isEnabled,
        setIsEnabled
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
};
