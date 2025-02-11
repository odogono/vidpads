'use client';

import { useCallback, useEffect, useState } from 'react';

import { createLog } from '@helpers/log';
import {
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/react';
import { useSettings } from '@model/hooks/useSettings';
import { integerToPadId, padIdToInteger } from '@model/pad';
import { CommonModal, CommonModalBase } from './CommonModal';

const log = createLog('MidiModal');

interface MidiMapping {
  padId: string;
  midiNote?: number;
  lastMessage?: string;
}

export const ConfigureMidiModal = ({ ref }: CommonModalBase) => {
  const { getSetting, updateSetting } = useSettings();
  const [isMidiEnabled, setMidiEnabled] = useState(
    getSetting('isMidiPlayEnabled') ?? false
  );
  const [midiPermission, setMidiPermission] =
    useState<PermissionState>('prompt');
  const [selectedPad, setSelectedPad] = useState<string | null>(null);

  const [mappings, setMappings] = useState<MidiMapping[]>(
    Array.from({ length: 16 }, (_, i) => ({
      padId: integerToPadId(i),
      midiNote: 0
    }))
  );

  // Handle MIDI permission check
  useEffect(() => {
    const checkMidiPermission = async () => {
      try {
        const result = await navigator.permissions.query({
          name: 'midi' as PermissionName
        });
        setMidiPermission(result.state);

        result.addEventListener('change', () => {
          setMidiPermission(result.state);
        });
      } catch (error) {
        log.error('Error checking MIDI permission:', error);
      }
    };

    checkMidiPermission();
  }, []);

  // Handle MIDI access
  useEffect(() => {
    if (!isMidiEnabled) return;

    const setupMidi = async () => {
      try {
        const midiAccess = await navigator.requestMIDIAccess();

        const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
          const [status, note, velocity] = event.data;

          // log.debug('MidiMessage', { selectedPad, status, note, velocity });

          if (selectedPad !== null && velocity === 0) {
            // Update mapping when a pad is selected and MIDI message is received

            // log.debug('Updating Mappings for', selectedPad);

            const newMappings = mappings.reduce<MidiMapping[]>(
              (acc, mapping) => {
                if (mapping.padId === selectedPad) {
                  acc.push({
                    ...mapping,
                    midiNote: note,
                    lastMessage: `Note: ${note}`
                  });
                  log.debug('Adding mapping', mapping.padId, selectedPad);
                } else {
                  acc.push(mapping);
                }

                return acc;
              },
              []
            );

            log.debug('New Mappings', newMappings);

            setMappings(newMappings);

            // setMappings((prev) =>
            //   prev.map((mapping) =>
            //     mapping.padId === selectedPad
            //       ? {
            //           ...mapping,
            //           midiNote: note,
            //           lastMessage: `Note: ${note}`
            //         }
            //       : mapping
            //   )
            // );

            // Update settings with new mapping
            // const newMappings = {
            //   ...mappings.midiMappings,
            //   [selectedPad]: note
            // };
            // updateSettings({ midiMappings: newMappings });

            setSelectedPad(null); // Reset selection after mapping
          }
        };

        // Set up MIDI input listeners
        midiAccess.inputs.forEach((input) => {
          input.addEventListener('midimessage', handleMidiMessage);
        });

        return () => {
          midiAccess.inputs.forEach((input) => {
            input.removeEventListener('midimessage', handleMidiMessage);
          });
        };
      } catch (error) {
        log.error('Error accessing MIDI:', error);
      }
    };

    setupMidi();
  }, [isMidiEnabled, mappings, selectedPad]);

  const handleMidiToggle = useCallback(async () => {
    const newEnabled = !isMidiEnabled;
    setMidiEnabled(newEnabled);
    updateSetting('isMidiPlayEnabled', newEnabled);
    log.debug('MidiToggle', { newEnabled });
  }, [isMidiEnabled, updateSetting]);

  return (
    <CommonModal ref={ref} title='Configure MIDI'>
      <div className='space-y-4 p-4'>
        <div className='flex items-center justify-between'>
          <span>Enable MIDI</span>
          <Switch
            checked={isMidiEnabled}
            onChange={handleMidiToggle}
            disabled={midiPermission === 'denied'}
          />
        </div>

        {midiPermission === 'denied' && (
          <div className='text-red-500'>
            MIDI access denied. Please enable MIDI access in your browser
            settings.
          </div>
        )}

        <Table
          isHeaderSticky
          aria-label='Settings'
          classNames={{
            wrapper: 'text-foreground bg-background',
            base: 'max-h-[30vh] overflow-scroll text-foreground',
            table: 'min-h-[320px]'
          }}
        >
          <TableHeader>
            <TableColumn>Pad</TableColumn>
            <TableColumn>MIDI Note</TableColumn>
            <TableColumn>Last Message</TableColumn>
          </TableHeader>
          <TableBody>
            {mappings.map((mapping) => (
              <TableRow
                key={mapping.padId}
                className={`cursor-pointer ${selectedPad === mapping.padId ? 'bg-primary-100' : ''}`}
                onClick={() => setSelectedPad(mapping.padId)}
              >
                <TableCell>Pad {mapping.padId}</TableCell>
                <TableCell>{mapping.midiNote ?? 'Not mapped'}</TableCell>
                <TableCell>{mapping.lastMessage ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {selectedPad !== null && (
          <div className='text-sm text-gray-600'>
            Press a MIDI key to map to Pad {selectedPad}...
          </div>
        )}
      </div>
    </CommonModal>
  );
};
