import { createLog } from '@helpers/log';

const log = createLog('midi');

export const isMidiSupported = () => {
  // we don't want any requests to be made
  if (!navigator.requestMIDIAccess) {
    return false;
  }

  return true;
};

export const requestMIDIAccess = async () => {
  if (!isMidiSupported()) return undefined;

  try {
    const midiAccess = await navigator.requestMIDIAccess();
    return midiAccess;
  } catch (err) {
    log.warn('MIDI access denied or not supported:', err);
    return undefined;
  }
};
