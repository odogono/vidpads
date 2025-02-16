import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { useSelector } from '@xstate/store/react';
import { KeyboardStoreType } from '../store';

const log = createLog('useKeyMap', ['debug']);

export const useKeyMap = (store: KeyboardStoreType) => {
  const events = useEvents();
  const activeKeys = useRef<Set<string>>(new Set());
  const [isEnabled, setIsEnabled] = useState(true);

  const keyMap = useSelector(store, (state) => state.context.keyMap);

  const clearActiveKeys = useCallback(() => {
    // const padKeys = Object.values(keyMap).filter((value) => value.padId);

    activeKeys.current.forEach((code) => {
      const entry = keyMap[code as keyof typeof keyMap];
      if (entry?.padId) {
        events.emit('pad:touchup', { padId: entry.padId, source: 'keyboard' });
      }
    });

    activeKeys.current.clear();
    log.debug('[keyboard] cleared all active keys');
  }, [events, keyMap]);

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
        // log.debug(
        //   '[keyboard] keydown already active:',
        //   code,
        //   activeKeys.current
        // );
        return;
      }

      activeKeys.current.add(code);

      // log.debug('[keyboard] keydown:', code, e.ctrlKey, e.metaKey);

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

      const entry = keyMap[code as keyof typeof keyMap];
      if (entry?.padId) {
        events.emit('pad:touchdown', {
          padId: entry.padId,
          source: 'keyboard'
        });
        return;
      }

      if (entry?.event) {
        const { event, fn } = entry;
        log.debug('[keyDown]', code, { event });
        events.emit(event);
        if (fn) fn();
        return;
      }
    },
    [events, isEnabled, keyMap]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const { code } = e;

      if (!isEnabled) return;

      if (!activeKeys.current.has(code)) return;

      activeKeys.current.delete(code);

      // log.debug('[keyUp] keyup:', code);

      const entry = keyMap[code as keyof typeof keyMap];
      if (entry?.padId) {
        events.emit('pad:touchup', { padId: entry.padId, source: 'keyboard' });
        return;
      }
    },
    [events, isEnabled, keyMap]
  );

  const resetKeyMap = useCallback(() => {
    store.send({ type: 'resetKeyMap' });
  }, [store]);

  const isKeyDown = (key: string) => activeKeys.current.has(key);
  const isKeyUp = (key: string) => !activeKeys.current.has(key);
  const handleBlur = useCallback(() => {
    if (!isEnabled) return;
    clearActiveKeys();
  }, [clearActiveKeys, isEnabled]);

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

  return {
    keyMap,
    clearActiveKeys,
    handleKeyDown,
    handleKeyUp,
    isEnabled,
    setIsEnabled,
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
    resetKeyMap
  };
};
