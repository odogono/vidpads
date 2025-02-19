import { useCallback, useEffect, useRef } from 'react';

import { createLog } from '@helpers/log';
import { requestMIDIAccess } from '@helpers/midi';
import { useSelectedPadId } from '@hooks/useProject/selectors';
import { MidiStoreType } from '../store';

const log = createLog('useMidiListener', ['debug']);

interface UseMidiListenerProps {
  isEnabled: boolean;
  store: MidiStoreType;
}

export const useMidiListener = ({ isEnabled, store }: UseMidiListenerProps) => {
  const { selectedPadId } = useSelectedPadId();
  const selectedPadIdRef = useRef(selectedPadId);

  useEffect(() => {
    // no idea whats going on, but the selectedPadId doesnt update as expected
    selectedPadIdRef.current = selectedPadId;
  }, [selectedPadId]);

  const handleMidiMessage = useCallback(
    (message: MIDIMessageEvent) => {
      const [status, note, velocity] = message.data as Uint8Array;

      // const inputId = (message.target as MIDIInput).id;
      const { id } = message.target as MIDIInput;

      // if (state === 'connected') {
      //   store.send({ type: 'inputConnected', id, name });
      // }
      // log.debug('handleMidiMessage', {
      //   note,
      //   selectedPadId,
      //   ref: selectedPadIdRef.current
      // });
      store.send({
        type: 'inputMessage',
        id,
        status,
        note,
        velocity,
        selectedPadId: selectedPadIdRef.current
      });
    },
    [store]
  );

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    store.send({ type: 'clearInputs' });

    const setupMidi = async () => {
      const midiAccess = await requestMIDIAccess();

      if (!midiAccess) return;

      midiAccess.inputs.forEach((input) => {
        log.debug(
          `[type:'${input.type}']` +
            ` name:'${input.name}' connection:${input.connection} state:${input.state}`,
          input
        );
        store.send({
          type: 'inputConnected',
          id: input.id,
          name: input.name,
          state: input.connection
        });
        input.addEventListener('midimessage', handleMidiMessage);
      });

      midiAccess.onstatechange = (e) => {
        const { id, state, name, connection } = e.port;
        log.debug('MIDI state changed', { name, id, state, connection });
        if (state === 'disconnected') {
          store.send({ type: 'inputDisconnected', id, state: connection });
        } else if (state === 'connected') {
          store.send({ type: 'inputConnected', id, name, state: connection });
        } else {
          log.debug('MIDI state changed', { name, id, state });
        }
      };

      cleanup = () => {
        midiAccess.inputs.forEach((input) => {
          input.removeEventListener('midimessage', handleMidiMessage);
        });
      };

      log.debug('MIDI setup complete', midiAccess);
    };

    if (isEnabled) {
      setupMidi();
    }

    // Return cleanup function to be called on unmount
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [handleMidiMessage, isEnabled, store]);
};
