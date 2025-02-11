export const midiNoteToName = (noteNumber: number) => {
  const noteNames = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B'
  ];
  const octave = Math.floor(noteNumber / 12) - 1;
  const note = noteNames[noteNumber % 12];
  return `${note}${octave}`;
};
