import { useCallback, useEffect, useRef } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';

const log = createLog('midi');

// Map MIDI note numbers to pad IDs (assuming standard MIDI notes)
const MIDI_PAD_MAP = {
  36: 'a1', // C1
  37: 'a2', // C#1
  38: 'a3', // D1
  39: 'a4', // D#1
  40: 'a5', // E1
  41: 'a6', // F1
  42: 'a7', // F#1
  43: 'a8', // G1
  44: 'a9', // G#1
  45: 'a10', // A1
  46: 'a11', // A#1
  47: 'a12', // B1
  48: 'a13', // C2
  49: 'a14', // C#2
  50: 'a15', // D2
  51: 'a16' // D#2
};

export const useMidiControls = () => {
  const events = useEvents();
  const activeNotes = useRef<Set<number>>(new Set());

  const handleMidiMessage = useCallback(
    (message: { data: number[] }) => {
      const [status, note, velocity] = message.data;

      // Note On event (144 = 0x90)
      if (status === 144 && velocity > 0) {
        if (activeNotes.current.has(note)) return;

        activeNotes.current.add(note);
        const padId = MIDI_PAD_MAP[note as keyof typeof MIDI_PAD_MAP];
        if (padId) {
          events.emit('pad:touchdown', { padId, source: 'midi' });
        }
      }
      // Note Off event (128 = 0x80 or Note On with velocity 0)
      else if (status === 128 || (status === 144 && velocity === 0)) {
        if (!activeNotes.current.has(note)) return;

        activeNotes.current.delete(note);
        const padId = MIDI_PAD_MAP[note as keyof typeof MIDI_PAD_MAP];
        if (padId) {
          events.emit('pad:touchup', { padId, source: 'midi' });
        }
      }
    },
    [events]
  );

  const initializeMidi = useCallback(async () => {
    try {
      // Request MIDI access
      const midiAccess = await navigator.requestMIDIAccess();

      // Add handlers for all MIDI inputs
      midiAccess.inputs.forEach((input) => {
        input.onmidimessage = (ev: MIDIMessageEvent) => {
          handleMidiMessage({ data: Array.from(ev.data || []) });
        };
      });

      // Handle when MIDI devices are connected/disconnected
      midiAccess.onstatechange = (e) => {
        const port = e.port;
        if (port.type === 'input') {
          if (port.state === 'connected') {
            // port.onstatechange = (ev: MIDIMessageEvent) => {
            //   handleMidiMessage({ data: Array.from(ev.data || []) });
            // };
          }
        }
      };
    } catch (err) {
      log.error('MIDI access denied or not supported:', err);
    }
  }, [handleMidiMessage]);

  useEffect(() => {
    initializeMidi();
  }, [initializeMidi]);

  return null;
};
