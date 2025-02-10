import { createLog } from '@helpers/log';
import {
  createPadUrl,
  isYTMediaUrl,
  parsePadUrl,
  toMediaUrl
} from '@helpers/metadata';
import { isYouTubeUrl, isYouTubeVideoId } from '@helpers/youtube';
import {
  Interval,
  LabelOperation,
  Operation,
  OperationExport,
  OperationType,
  Pad,
  PadExport,
  PlaybackOperation,
  SourceOperation
} from '@model/types';
import {
  createPad,
  getPadInterval,
  getPadLabel,
  getPadSourceUrl,
  setPadChokeGroup,
  setPadInterval,
  setPadIsOneShot,
  setPadLabel,
  setPadOperations,
  setPadPlayPriority,
  setPadPlaybackResume,
  setPadSource
} from '../pad';
import {
  exportOperationToJSON,
  exportOperationToURL,
  importOperationFromJSON,
  importOperationFromURL
} from './operation';

export interface ImportPadFromJSONProps {
  pad: PadExport | undefined;
  importSource?: boolean;
}

const log = createLog('model/serialise/pad', ['debug']);

export const importPadFromJSON = ({
  pad,
  importSource = false
}: ImportPadFromJSONProps): Pad | undefined => {
  if (!pad) {
    return undefined;
  }

  const operations =
    (pad.operations
      ?.map(importOperationFromJSON)
      .filter(Boolean) as Operation[]) ?? [];

  const [opsWithoutSource, sourceOp] = extractOp(
    operations,
    OperationType.Source
  );
  const sourceUrl =
    (sourceOp as SourceOperation | undefined)?.url ?? pad.source;
  const [opsWithoutLabel, labelOp] = extractOp(
    opsWithoutSource,
    OperationType.Label
  );
  const label = (labelOp as LabelOperation | undefined)?.label ?? pad.label;

  const [opsWithoutPlayback, playbackOp] = extractOp(
    opsWithoutLabel,
    OperationType.Playback
  );

  const { isOneShot, resume, priority, chokeGroup } =
    (playbackOp as PlaybackOperation | undefined) ?? {};

  const finalOps = opsWithoutPlayback;

  const { id } = pad;

  const a = createPad(id);
  const b = setPadOperations(a, finalOps);
  const c = setPadLabel(b, label);
  const d = setPadPlayPriority(c, priority);
  const e = setPadChokeGroup(d, chokeGroup);
  const f = setPadIsOneShot(e, isOneShot);
  const g = setPadPlaybackResume(f, resume);
  const h = importSource ? setPadSource(g, sourceUrl) : g;

  return h;
};

export const exportPadToJSON = (
  pad: Pad,
  asOperations: boolean = false
): PadExport | undefined => {
  const { id, pipeline } = pad;

  const { operations } = pipeline;
  const ops = operations
    ?.map(exportOperationToJSON)
    .filter(Boolean) as OperationExport[];

  const [opsWithoutSource, sourceOp] = extractOp(
    ops,
    OperationType.Source,
    asOperations
  );
  const sourceUrl =
    (sourceOp as SourceOperation | undefined)?.url ?? getPadSourceUrl(pad);

  const [opsWithoutLabel, labelOp] = extractOp(
    opsWithoutSource,
    OperationType.Label,
    asOperations
  );
  const label =
    (labelOp as LabelOperation | undefined)?.label ?? getPadLabel(pad);

  // const [opsWithoutPlayPriority, playPriorityOp] = extractOp(
  //   opsWithoutLabel,
  //   OperationType.PlayPriority,
  //   asOperations
  // );
  // const playPriority =
  //   (playPriorityOp as PlayPriorityOperation | undefined)?.priority ??
  //   getPadPlayPriority(pad);

  // const [opsWithoutChokeGroup, chokeGroupOp] = extractOp(
  //   opsWithoutPlayPriority,
  //   OperationType.ChokeGroup,
  //   asOperations
  // );
  // const chokeGroup =
  //   (chokeGroupOp as ChokeGroupOperation | undefined)?.group ??
  //   getPadChokeGroup(pad);

  const finalOps = opsWithoutLabel;

  if (!sourceUrl && finalOps.length === 0) {
    return undefined;
  }

  const result = { id };

  if (asOperations) {
    const sourceOp = sourceUrl
      ? applyOp(finalOps, {
          type: OperationType.Source,
          url: sourceUrl
        } as SourceOperation)
      : finalOps;
    const labelOp = label
      ? applyOp(sourceOp, {
          type: OperationType.Label,
          label
        } as LabelOperation)
      : sourceOp;
    return applyToPadExport(result, 'operations', labelOp);
  }

  const resultWithLabel = applyToPadExport(result, 'label', label);
  const resultWithSource = applyToPadExport(
    resultWithLabel,
    'source',
    sourceUrl
  );
  // const resultWithPlayPriority = applyToPadExport(
  //   resultWithSource,
  //   'playPriority',
  //   playPriority
  // );
  // const resultWithChokeGroup = applyToPadExport(
  //   resultWithPlayPriority,
  //   'chokeGroup',
  //   chokeGroup
  // );

  return applyToPadExport(resultWithSource, 'operations', finalOps);
};

const applyToPadExport = (
  pad: PadExport,
  key: keyof PadExport,
  value: unknown
) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return pad;
  }
  return { ...pad, [key]: value };
};

const extractOp = (
  ops: Operation[] | undefined,
  type: OperationType,
  remove: boolean = true
): [Operation[], Operation | undefined] => {
  if (!ops) {
    return [[], undefined];
  }
  const op = ops.find((op) => op.type === type);
  if (!op) {
    return [ops, undefined];
  }
  return remove ? [ops.filter((op) => op.type !== type), op] : [ops, op];
};

const applyOp = (ops: Operation[], op: Operation) => {
  return [op, ...ops.filter((o) => o.type !== op.type)];
};

export const exportPadToURLString = (pad: Pad): string | undefined => {
  // export, but ask to keep the operations
  const json = exportPadToJSON(pad, true);

  // console.debug('[exportPadToURLString] json:', JSON.stringify(json, null, 2));
  if (!json) {
    return undefined;
  }

  const { id, operations } = json;

  const ops =
    operations?.reduce((acc, op) => {
      const url = exportOperationToURL(op);
      if (url) {
        acc.push(url);
      }
      return acc;
    }, [] as string[]) ?? [];

  const opsURL = ops.join('+') ?? '';

  return `${id}[${opsURL}`;
};

export const importPadFromURLString = (
  urlString?: string
): PadExport | undefined => {
  if (!urlString) {
    return undefined;
  }

  const [id, opsStr] = urlString.split('[');

  log.debug('[importPadFromURLString] opsStr:', { id, opsStr });

  const ops = opsStr
    ?.split('+')
    .map(importOperationFromURL)
    .filter(Boolean) as OperationExport[];

  const [opsWithoutLabel, labelOp] = extractOp(ops, OperationType.Label);
  const label = (labelOp as LabelOperation | undefined)?.label;

  const [opsWithoutSource, sourceOp] = extractOp(
    opsWithoutLabel,
    OperationType.Source
  );
  const source = (sourceOp as SourceOperation | undefined)?.url;

  const result = {
    id,
    operations: opsWithoutSource
  };

  const resultWithLabel = applyToPadExport(result, 'label', label);
  const resultWithSource = applyToPadExport(resultWithLabel, 'source', source);

  return resultWithSource;
};

export const exportPadToClipboard = (pad: Pad) => {
  const source = getPadSourceUrl(pad);

  if (!source) {
    return '';
  }

  const data = exportPadToURLString(pad);

  if (isYTMediaUrl(source)) {
    const { start } = getPadInterval(pad, {
      start: -1,
      end: -1
    }) as Interval;

    // build a url with the start time and and the data
    const url = new URL(source!);

    if (start !== -1) {
      url.searchParams.set('t', Math.round(start).toString());
    }
    if (data) {
      url.searchParams.set('x-vop-data', data);
    }

    return url.toString();
  }

  return createPadUrl({ data });
};

export const importPadFromClipboard = (
  urlString: string,
  importSource: boolean = true
): Pad | undefined => {
  if (!urlString) {
    return undefined;
  }

  if (isYouTubeVideoId(urlString)) {
    const mediaUrl = toMediaUrl(urlString);
    if (!mediaUrl) {
      return undefined;
    }
    const pad = setPadSource(createPad('incoming'), mediaUrl);
    return pad;
  }

  if (isYouTubeUrl(urlString)) {
    const url = new URL(urlString);
    const data = url.searchParams.get('x-vop-data');
    if (!data) {
      const mediaUrl = toMediaUrl(urlString);
      if (!mediaUrl) {
        return undefined;
      }

      const pad = setPadSource(createPad('incoming'), mediaUrl);

      const time = url.searchParams.get('t');

      if (time) {
        const interval = { start: parseInt(time), end: -1 };
        return setPadInterval(pad, interval);
      }

      return pad;
    }
    const imported = data ? importPadFromURLString(data) : undefined;
    return imported
      ? importPadFromJSON({ pad: imported, importSource })
      : undefined;
  }

  const padUrlData = parsePadUrl(urlString);

  if (padUrlData) {
    const imported = padUrlData.data
      ? importPadFromURLString(padUrlData.data)
      : undefined;
    return imported
      ? importPadFromJSON({ pad: imported, importSource })
      : undefined;
  }

  return undefined;
};
