import {
  createPad,
  getPadInterval,
  getPadIsOneShot,
  getPadLabel,
  getPadSourceUrl,
  getPadVolume,
  setPadIsOneShot
} from '@model/pad';
import {
  OperationType,
  Pad,
  PadExport,
  SourceOperation,
  TrimOperation,
  VolumeOperation
} from '@model/types';
import {
  exportPadToJSON,
  exportPadToURLString,
  importPadFromJSON,
  importPadFromURLString
} from '../pad';

describe('pad serialization', () => {
  const simplePad: Pad = {
    id: 'pad1',
    pipeline: {
      source: {
        type: OperationType.Source,
        url: 'https://example.com/video.mp4'
      },
      operations: []
    }
  };

  const complexPad: Pad = {
    id: 'pad2',
    pipeline: {
      source: {
        type: OperationType.Source,
        url: 'https://example.com/video.mp4'
      },
      operations: [
        {
          type: OperationType.Trim,
          start: 0,
          end: 10
        } as TrimOperation,
        {
          type: OperationType.Volume,
          envelope: [
            { time: 0, value: 1 },
            { time: 5, value: 0.5 }
          ]
        } as VolumeOperation
      ]
    }
  };

  describe('JSON serialization', () => {
    it('should export a simple pad to JSON', () => {
      const exported = exportPadToJSON(simplePad);
      expect(exported).toEqual({
        id: 'pad1',
        source: 'https://example.com/video.mp4'
      });
    });

    it('should export a complex pad to JSON', () => {
      const exported = exportPadToJSON(complexPad);
      expect(exported).toEqual({
        id: 'pad2',
        source: 'https://example.com/video.mp4',
        operations: [
          {
            type: OperationType.Trim,
            start: 0,
            end: 10
          },
          {
            type: OperationType.Volume,
            envelope: [
              { time: 0, value: 1 },
              { time: 5, value: 0.5 }
            ]
          }
        ]
      });
    });

    it('should import a pad from JSON', () => {
      const padExport: PadExport = {
        id: 'pad1',
        source: 'https://example.com/video.mp4',
        operations: [
          {
            type: OperationType.Trim,
            start: 0,
            end: 10
          } as TrimOperation
        ]
      };

      const imported = importPadFromJSON({
        pad: padExport,
        importSource: true
      });

      expect(imported).toEqual({
        id: 'pad1',
        pipeline: {
          operations: [
            {
              type: OperationType.Trim,
              start: 0,
              end: 10
            },
            {
              type: OperationType.Source,
              url: 'https://example.com/video.mp4'
            }
          ]
        }
      });
    });

    it('should handle undefined pad when importing', () => {
      const imported = importPadFromJSON({ pad: undefined });
      expect(imported).toBeUndefined();
    });

    it('should handle source being defined in operations', () => {
      const pad: PadExport = {
        id: 'pad1',
        source: 'https://youtu.be/dQw4w9WgXcQ',
        operations: [
          {
            type: OperationType.Source,
            url: 'https://example.com/video.mp4'
          } as SourceOperation
        ]
      };

      const imported = importPadFromJSON({ pad, importSource: true });
      expect(getPadSourceUrl(imported)).toBe('https://example.com/video.mp4');
    });

    it('should serialise the label', () => {
      const pad: Pad = {
        ...simplePad,
        label: 'Test Label'
      };

      const exported = exportPadToJSON(pad);
      const imported = importPadFromJSON({ pad: exported, importSource: true });
      expect(imported?.label).toBe('Test Label');
    });

    describe('playback operations', () => {
      it('should serialise and deserialise oneshot', () => {
        const pad: Pad = createPad('pad1');
        const a = setPadIsOneShot(pad, true);

        const exported = exportPadToJSON(a!);

        const imported = importPadFromJSON({
          pad: exported,
          importSource: true
        });

        expect(getPadIsOneShot(imported)).toBe(true);
      });

      it('should serialise and deserialise false oneshot', () => {
        const pad: Pad = createPad('pad1');
        const a = setPadIsOneShot(pad, false);

        const exported = exportPadToJSON(a!);

        const imported = importPadFromJSON({
          pad: exported,
          importSource: true
        });

        expect(getPadIsOneShot(imported)).toBe(false);
      });
    });
  });

  describe('URL string serialization', () => {
    it('should export a simple pad to URL string', () => {
      const exported = exportPadToURLString(simplePad);
      expect(exported).toBe('pad1[s:~sexample.com%2Fvideo.mp4');
    });

    it('should export a complex pad to URL string', () => {
      const exported = exportPadToURLString(complexPad);
      expect(exported).toBe(
        'pad2[s:~sexample.com%2Fvideo.mp4+t:0:10+v:0:1:5:0.5'
      );
    });

    it('should import a pad from URL string', () => {
      const urlString = 'pad1[s:~sexample.com%2Fvideo.mp4+t:0:10+v:0:1:5:0.5';
      const imported = importPadFromURLString(urlString);
      const pad = importPadFromJSON({ pad: imported, importSource: true });

      expect(pad?.id).toBe('pad1');
      expect(getPadSourceUrl(pad)).toBe('https://example.com/video.mp4');
      expect(getPadInterval(pad)?.start).toBe(0);
      expect(getPadInterval(pad)?.end).toBe(10);
      expect(getPadVolume(pad)).toBe(0.5);
    });

    it('should export a pad with a shortened YT url', () => {
      const pad: Pad = {
        ...simplePad,
        pipeline: {
          ...simplePad.pipeline,
          source: {
            type: OperationType.Source,
            url: 'https://youtu.be/dQw4w9WgXcQ'
          }
        }
      };

      const exported = exportPadToURLString(pad);
      expect(exported).toBe('pad1[s:~ydQw4w9WgXcQ');
    });

    it('should export a pad source op with a shortened YT url', () => {
      const pad: Pad = {
        ...simplePad,
        pipeline: {
          operations: [
            {
              type: OperationType.Source,
              url: 'https://youtu.be/dQw4w9WgXcQ'
            } as SourceOperation
          ]
        }
      };

      const exported = exportPadToURLString(pad);
      expect(exported).toBe('pad1[s:~ydQw4w9WgXcQ');
    });

    it('should serialise the label', () => {
      const pad: Pad = {
        ...simplePad,
        label: 'Test Label'
      };

      const exported = exportPadToURLString(pad);

      const importedJson = importPadFromURLString(exported);
      const imported = importPadFromJSON({
        pad: importedJson,
        importSource: true
      });

      expect(getPadLabel(imported)).toBe('Test Label');
    });
  });
});
