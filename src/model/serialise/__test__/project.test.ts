import '@testing-library/jest-dom';

// import { createLog } from '@helpers/log';
import {
  exportToURLString,
  importProjectExport,
  urlStringToProject
} from '@/model/serialise/project';
import { isoStringToDate } from '@helpers/datetime';
import { initialContext } from '@model/store/store';
import { ProjectStoreContextType, ProjectStoreType } from '@model/store/types';
import {
  OperationType,
  Pad,
  ProjectExport,
  SourceOperation,
  TrimOperation
} from '@model/types';
import { exportPadToURLString, importPadFromURLString } from '../pad';

const defaultContext = {
  ...initialContext,
  startTime: '2024-01-01T00:00:00.000Z',
  projectId: 'test-project',
  projectName: 'Test Project',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  pads: [] as Pad[]
} as ProjectStoreContextType;

// const log = createLog('export.test');

describe('exportToURLString', () => {
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
  } as ProjectStoreType;

  it('should export basic project info to URL string', async () => {
    const result = await exportToURLString(mockStore);
    // Split URL components
    const [version] = result.split('|');

    expect(version).toBe('3');
  });

  it('should handle empty project name', async () => {
    const emptyNameStore = {
      getSnapshot: () => ({
        context: {
          ...initialContext,
          startTime: '2024-01-01T00:00:00.000Z',
          projectId: 'test-project',
          projectName: '',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
          pads: [] as Pad[]
        } as ProjectStoreContextType
      })
    } as ProjectStoreType;

    const result = await exportToURLString(emptyNameStore);

    const imported = await urlStringToProject(result);

    expect(imported.name).toBe('');
  });

  it('should handle pads with operations', async () => {
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
                  url: 'odgn-vo://media/vid1'
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
        } as ProjectStoreContextType
      })
    } as ProjectStoreType;

    const result = await exportToURLString(storeWithPads);

    const imported = await urlStringToProject(result);

    expect(imported.id).toBe('test-project');
    expect(imported.name).toBe('Test Project');
    expect(imported.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(imported.updatedAt).toBe('2024-01-02T00:00:00Z');
    expect(imported.pads.length).toBe(1);
    expect(imported.pads[0].id).toBe('pad1');
    expect(imported.pads[0].source).toBe('odgn-vo://media/vid1');

    expect((imported.pads[0].operations?.[0] as TrimOperation).start).toBe(
      1.23
    );
    expect((imported.pads[0].operations?.[0] as TrimOperation).end).toBe(4.56);
  });
});

describe('exportPadToURLString', () => {
  it('should export pad to URL string', () => {
    const pad: Pad = {
      id: 'pad1',
      pipeline: {
        operations: [
          {
            type: OperationType.Source,
            url: 'odgn-vo://media/vid2'
          } as SourceOperation,
          {
            type: OperationType.Trim,
            start: 1.23,
            end: 4.56
          } as TrimOperation
        ]
      }
    };

    // const json = exportPadToJSON(pad);

    const exported = exportPadToURLString(pad);

    const imported = importPadFromURLString(exported!);

    expect(imported).toEqual({
      id: 'pad1',
      source: 'odgn-vo://media/vid2',
      operations: [
        {
          type: OperationType.Trim,
          start: 1.23,
          end: 4.56
        } as TrimOperation
      ]
    });
    // log.debug(JSON.stringify(imported, null, 2));
  });
});

describe('importPadFromURLString', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const project: ProjectExport = {
    id: '08978bb8',
    name: 'DJ Premier on the Wheels of Steel',
    exportVersion: '1',
    createdAt: '2025-01-14T12:42:34Z',
    updatedAt: '2025-01-18T17:24:42Z',
    pads: [
      {
        id: 'a1',
        source: 'Sff7Kc77QAY',
        operations: [
          {
            type: OperationType.Trim,
            start: 178.7,
            end: 207.7
          } as TrimOperation
        ]
      },
      {
        id: 'a2',
        source: 'WeoCOdbAy3s',
        operations: [
          { type: OperationType.Trim, start: 166.6, end: 208 } as TrimOperation
        ]
      },
      {
        id: 'a3',
        source: 'TgelVkHEKdw',
        operations: [
          { type: OperationType.Trim, start: 214, end: 264.4 } as TrimOperation
        ]
      },
      {
        id: 'a4',
        source: 'xnI8JEW7Ty4',
        operations: [
          { type: OperationType.Trim, start: 176, end: 191.2 } as TrimOperation
        ]
      },
      {
        id: 'a5',
        source: 'FNj-m_s0ngA',
        operations: [
          { type: OperationType.Trim, start: 13.3, end: 24.3 } as TrimOperation
        ]
      },
      { id: 'a9', source: 'RDhkRQ2jY9Q' },
      {
        id: 'a10',
        source: 'Sff7Kc77QAY',
        operations: [
          { type: OperationType.Trim, start: 33.3, end: 35.9 } as TrimOperation
        ]
      }
    ]
  };

  const data =
    '1|08978bb8|REolMjBQcmVtaWVyJTIwb24lMjB0aGUlMjBXaGVlbHMlMjBvZiUyMFN0ZWVs|1736858554|1737221082|a1[s:Sff7Kc77QAY+t:178.7:207.7(a2[s:WeoCOdbAy3s+t:166.6:208(a3[s:TgelVkHEKdw+t:214:264.4(a4[s:xnI8JEW7Ty4+t:176:191.2(a5[s:FNj-m_s0ngA+t:13.3:24.3(a9[s:RDhkRQ2jY9Q(a10[s:Sff7Kc77QAY+t:33.3:35.9|60[0[30[';

  it('should export project to URL string', async () => {
    jest.setSystemTime(isoStringToDate('2025-01-18T17:24:42Z'));
    const context = importProjectExport(project);
    const mockStore = {
      getSnapshot: () => ({
        context
      })
    } as ProjectStoreType;

    const result = await exportToURLString(mockStore, 1);
    const imported = await urlStringToProject(result);

    expect(imported.pads[5].source).toBe('RDhkRQ2jY9Q');
  });

  it('should import project from URL string', async () => {
    const imported = await urlStringToProject(data);

    // log.debug(JSON.stringify(project, null, 2));

    expect(imported.id).toBe('08978bb8');
    expect(imported.name).toBe('DJ Premier on the Wheels of Steel');
    expect(imported.createdAt).toBe('2025-01-14T12:42:34Z');
    expect(imported.updatedAt).toBe('2025-01-18T17:24:42Z');
    expect(imported.pads.length).toBe(7);

    expect(imported.sequencer).toBeDefined();
  });

  // it('should import a project with sequencer data from a URL string', () => {
  //   const data =
  //     '1%7C5dfc6cf5%7C808%7C1737733737341%7C1738259649629%7Ca1%5Bhttps%253A%252F%252Fyoutu.be%252FgsZ7izQpywY%5Bt%3A1%3A2%28a2%5Bhttps%253A%252F%252Fyoutu.be%252FgsZ7izQpywY%5Bt%3A17%3A17.1%28a3%5Bhttps%253A%252F%252Fyoutu.be%252FgsZ7izQpywY%5Bt%3A30.12%3A31%28a4%5Bhttps%253A%252F%252Fyoutu.be%252FgsZ7izQpywY%5Bt%3A170.29%3A171%28a5%5Bhttps%253A%252F%252Fyoutu.be%252FgsZ7izQpywY%5Bt%3A146.85%3A147.992%2Bpb%3A1%28a6%5Bhttps%253A%252F%252Fyoutu.be%252FgsZ7izQpywY%5Bt%3A91.605%3A184.212%2Bpb%3A1%28a11%5Bhttps%253A%252F%252Fyoutu.be%252FrtqTmUVjsuY%5Bt%3A286.768%3A290.431%28a12%5Bhttps%253A%252F%252Fyoutu.be%252FmFTpDtjkHV8%5Bt%3A28.91%3A31.171%28a13%5Bhttps%253A%252F%252Fyoutu.be%252FCYdOUyPcUm4%5Bt%3A126.457%3A130.12%2Bpb%3A1%28a14%5Bhttps%253A%252F%252Fyoutu.be%252FCYdOUyPcUm4%5Bt%3A600.713%3A604.593%2Bpb%3A1.29%2Bv%3A0%3A0.47%28a15%5Bhttps%253A%252F%252Fyoutu.be%252FmFTpDtjkHV8%5Bt%3A0.905%3A179%28a16%5Bhttps%253A%252F%252Fyoutu.be%252FmFTpDtjkHV8%5Bt%3A25.891%3A179%7C60%5B0%5B45%5Ba15%280%3A3.982%2Ba1%280.372%3A0.308%3A1.306%3A0.308%3A2.222%3A0.308%3A3.123%3A0.308%3A4.038%3A0.309%3A4.972%3A0.309%3A5.906%3A0.308%3A6.807%3A0.309%2Ba3%280.604%3A0.185%3A1.739%3A0.166%3A2.688%3A0.184%3A3.656%3A0.101%3A3.939%3A0.151%3A4.806%3A0.166%3A5.758%3A0.148%3A6.856%3A0.199%2Ba16%282.105%3A1.691';

  //   const project = urlStringToProject(decodeURIComponent(data));

  //   expect(project.sequencer).toBeDefined();
  // });
});
