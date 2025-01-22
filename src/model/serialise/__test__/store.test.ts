import '@testing-library/jest-dom';

import { createLog } from '@helpers/log';
import { InternalToExternalUrlMap } from '@model/hooks/useMetadata';
import { exportToURLString, urlStringToProject } from '@model/serialise/store';
import { StoreContextType, StoreType } from '@model/store/types';
import { OperationType, Pad, TrimOperation } from '@model/types';
import {
  exportPadToJSON,
  exportPadToURLString,
  importPadFromURLString
} from '../pad';

const defaultContext = {
  isInitial: false,
  startTime: '2024-01-01T00:00:00.000Z',
  projectId: 'test-project',
  projectName: 'Test Project',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  pads: [] as Pad[]
} as StoreContextType;

const log = createLog('export.test');

const mockUrlMap: InternalToExternalUrlMap = {
  'vidpads://media/vid1': 'https://example.com/video1',
  'vidpads://media/vid2': 'https://example.com/video2?start=2.6'
};

describe.skip('exportToURLString', () => {
  const mockStore = {
    getSnapshot: () => ({
      context: {
        projectId: 'test-project',
        projectName: 'Test Project',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        pads: [] as Pad[]
      }
    })
  } as StoreType;

  it('should export basic project info to URL string', () => {
    const result = exportToURLString(mockStore, mockUrlMap);

    // Split URL components
    const [version, projectId, projectName, createTime, updateTime, ...rest] =
      result.split('|');

    expect(version).toBe('1'); // EXPORT_URL_VERSION
    expect(projectId).toBe('test-project');
    expect(decodeURIComponent(projectName)).toBe('Test Project');
    expect(createTime).toBe('1704067200000'); // 2024-01-01T00:00:00.000Z in ms
    expect(updateTime).toBe('1704153600000'); // 2024-01-02T00:00:00.000Z in ms
    expect(rest.join('|')).toBe(''); // No pads
  });

  it('should handle empty project name', () => {
    const emptyNameStore = {
      getSnapshot: () => ({
        context: {
          isInitial: false,
          startTime: '2024-01-01T00:00:00.000Z',
          projectId: 'test-project',
          projectName: '',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
          pads: [] as Pad[]
        } as StoreContextType
      })
    } as StoreType;

    const result = exportToURLString(emptyNameStore, mockUrlMap);
    const [, , projectName] = result.split('|');
    expect(projectName).toBe('');
  });

  it('should handle pads with operations', () => {
    const storeWithPads = {
      getSnapshot: () => ({
        context: {
          ...defaultContext,
          pads: [
            {
              id: 'pad1',
              pipeline: {
                source: {
                  type: OperationType.Source,
                  url: 'vidpads://media/vid1'
                },
                operations: [
                  {
                    type: OperationType.Trim,
                    start: 1.23,
                    end: 4.56
                  } as TrimOperation
                ]
              }
            }
          ]
        } as StoreContextType
      })
    } as StoreType;

    const result = exportToURLString(storeWithPads, mockUrlMap);

    log.debug(result);

    const [version, projectId, projectName, padData] = result.split('|');

    expect(version).toBe('1');
    expect(projectId).toBe('test-project');
    expect(decodeURIComponent(projectName)).toBe('Test Project');

    // Check pad data format: padId|sourceUrl|operations
    const [padId, sourceUrl, operations] = padData.split('|');
    expect(padId).toBe('pad1');
    expect(sourceUrl).toBe('https://example.com/video1');
    expect(operations).toBe('Trim,1.23,4.56');
  });
});

describe('exportPadToURLString', () => {
  it('should export pad to URL string', () => {
    const pad: Pad = {
      id: 'pad1',
      pipeline: {
        source: {
          type: OperationType.Source,
          url: 'vidpads://media/vid2'
        },
        operations: [
          {
            type: OperationType.Trim,
            start: 1.23,
            end: 4.56
          } as TrimOperation
        ]
      }
    };

    const json = exportPadToJSON(pad, mockUrlMap);

    const exported = exportPadToURLString(pad, mockUrlMap);

    // log.debug(exported);

    const imported = importPadFromURLString(exported!);

    expect(imported).toEqual(json);

    // log.debug(JSON.stringify(imported, null, 2));
  });
});

describe('importPadFromURLString', () => {
  it('should import project from URL string', async () => {
    const data =
      '1|08978bb8|DJ%20Premier%20on%20the%20Wheels%20of%20Steel|1736858554520|1737221082587|a1[Sff7Kc77QAY[trim,178.7,207.7(a2[WeoCOdbAy3s[trim,166.6,208(a3[TgelVkHEKdw[trim,214,264.4(a4[xnI8JEW7Ty4[trim,176,191.2(a5[FNj-m_s0ngA[trim,13.3,24.3(a9[RDhkRQ2jY9Q[(a10[Sff7Kc77QAY[trim,33.3,35.9';

    const project = urlStringToProject(data);

    // log.debug(JSON.stringify(project, null, 2));

    expect(project.id).toBe('08978bb8');
    expect(project.name).toBe('DJ Premier on the Wheels of Steel');
    expect(project.createdAt).toBe('2025-01-14T12:42:34.520Z');
    expect(project.updatedAt).toBe('2025-01-18T17:24:42.587Z');
    expect(project.pads.length).toBe(7);

    const json = {
      id: '08978bb8',
      name: 'DJ Premier on the Wheels of Steel',
      exportVersion: '1',
      createdAt: '2025-01-14T12:42:34.520Z',
      updatedAt: '2025-01-18T17:24:42.587Z',
      pads: [
        {
          id: 'a1',
          source: 'Sff7Kc77QAY',
          operations: [{ type: 'trim', start: 178.7, end: 207.7 }]
        },
        {
          id: 'a2',
          source: 'WeoCOdbAy3s',
          operations: [{ type: 'trim', start: 166.6, end: 208 }]
        },
        {
          id: 'a3',
          source: 'TgelVkHEKdw',
          operations: [{ type: 'trim', start: 214, end: 264.4 }]
        },
        {
          id: 'a4',
          source: 'xnI8JEW7Ty4',
          operations: [{ type: 'trim', start: 176, end: 191.2 }]
        },
        {
          id: 'a5',
          source: 'FNj-m_s0ngA',
          operations: [{ type: 'trim', start: 13.3, end: 24.3 }]
        },
        { id: 'a9', source: 'RDhkRQ2jY9Q' },
        {
          id: 'a10',
          source: 'Sff7Kc77QAY',
          operations: [{ type: 'trim', start: 33.3, end: 35.9 }]
        }
      ]
    };

    expect(project).toEqual(json);
  });
});
