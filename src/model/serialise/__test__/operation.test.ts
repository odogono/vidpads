import {
  OperationType,
  SourceOperation,
  TrimOperation,
  VolumeOperation
} from '@model/types';
import {
  exportOperationToJSON,
  exportOperationToURL,
  importOperationFromJSON,
  importOperationFromURL
} from '../operation';

describe('Operation serialization', () => {
  describe('JSON serialization', () => {
    it('should handle undefined operations', () => {
      expect(exportOperationToJSON(undefined)).toBeUndefined();
      expect(importOperationFromJSON(undefined)).toBeUndefined();
    });

    it('should serialize and deserialize trim operations', () => {
      const trimOperation: TrimOperation = {
        type: OperationType.Trim,
        start: 1.23456,
        end: 4.56789
      };

      const expected = { ...trimOperation, start: 1.235, end: 4.568 };

      const exported = exportOperationToJSON(trimOperation);
      const imported = importOperationFromJSON(exported);

      expect(exported).toEqual(expected);
      expect(imported).toEqual(expected);
    });

    it('should serialize and deserialize volume operations', () => {
      const volumeOperation: VolumeOperation = {
        type: OperationType.Volume,
        envelope: [
          { time: 0, value: 1 },
          { time: 2.5, value: 0.5 },
          { time: 5, value: 0.75 }
        ]
      };

      const exported = exportOperationToJSON(volumeOperation);
      const imported = importOperationFromJSON(exported);

      expect(exported).toEqual(volumeOperation);
      expect(imported).toEqual(volumeOperation);
    });

    it('should handle unknown operation types', () => {
      const unknownOperation = {
        type: 'unknown' as OperationType,
        someData: 123
      };

      expect(exportOperationToJSON(unknownOperation)).toBeUndefined();
      expect(importOperationFromJSON(unknownOperation)).toBeUndefined();
    });
  });

  describe('URL serialization', () => {
    it('should handle undefined operations', () => {
      expect(exportOperationToURL(undefined)).toBe('');
    });

    describe('trim operations', () => {
      it('should serialize and deserialize trim operations', () => {
        const trimOperation: TrimOperation = {
          type: OperationType.Trim,
          start: 1.23456,
          end: 4.56789
        };

        const exported = exportOperationToURL(trimOperation);
        const imported = importOperationFromURL(exported!);

        expect(exported).toBe('t:1.235:4.568');
        expect(imported).toEqual({
          type: OperationType.Trim,
          start: 1.235,
          end: 4.568
        });
      });
    });

    describe('source operations', () => {
      it('should serialize and deserialize source operations', () => {
        const sourceOperation: SourceOperation = {
          type: OperationType.Source,
          url: 'https://example.com/video.mp4'
        };

        const exported = exportOperationToURL(sourceOperation);
        const imported = importOperationFromURL(exported!);

        expect(exported).toBe('s:~sexample.com%2Fvideo.mp4');
        expect(imported).toEqual(sourceOperation);
      });
    });

    describe('volume operations', () => {
      it('should serialize and deserialize volume operations', () => {
        const volumeOperation: VolumeOperation = {
          type: OperationType.Volume,
          envelope: [
            { time: 0, value: 1 },
            { time: 2.5, value: 0.5 }
          ]
        };

        const exported = exportOperationToURL(volumeOperation);
        const imported = importOperationFromURL(exported!);

        expect(exported).toBe('v:0:1:2.5:0.5');
        expect(imported).toEqual(volumeOperation);
      });

      it('should handle empty volume envelope', () => {
        const volumeOperation: VolumeOperation = {
          type: OperationType.Volume,
          envelope: []
        };

        const exported = exportOperationToURL(volumeOperation);
        const imported = importOperationFromURL(exported!);

        expect(exported).toBe('v:');
        expect(imported).toEqual(volumeOperation);
      });
    });

    it('should handle invalid URL strings', () => {
      expect(
        importOperationFromURL('invalid:operation:string')
      ).toBeUndefined();
    });

    it('should handle unknown operation types in URL', () => {
      expect(importOperationFromURL('unknown:1:2:3')).toBeUndefined();
    });
  });
});
