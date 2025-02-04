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
  Pipeline,
  SourceOperation
} from '@model/types';
import {
  createPad,
  getPadInterval,
  getPadLabel,
  getPadSourceUrl,
  setPadInterval,
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

  const operations = pad.operations
    ?.map(importOperationFromJSON)
    .filter(Boolean) as Operation[];

  const srcOp = operations?.find((op) => op.type === OperationType.Source) as
    | SourceOperation
    | undefined;
  const filteredOps = srcOp
    ? operations.filter((op) => op.type !== OperationType.Source)
    : operations;

  const pipeline: Pipeline = {
    operations: filteredOps
  };

  const source = srcOp ? srcOp.url : pad.source;
  const { id, label } = pad;

  const result = {
    id,
    pipeline
  };

  const resultWithLabel = label ? { ...result, label } : result;

  return setPadSource(resultWithLabel, importSource ? source : undefined);
};

export const exportPadToJSON = (pad: Pad): PadExport | undefined => {
  const { id, label, pipeline } = pad;

  const { operations } = pipeline;
  const source = getPadSourceUrl(pad);

  if (!source) {
    return undefined;
  }

  const ops = operations
    ?.map(exportOperationToJSON)
    .filter(Boolean) as OperationExport[];

  const opsWithSource = source
    ? [{ type: OperationType.Source, url: source }, ...(ops ?? [])]
    : ops;

  const result = { id };
  const resultWithLabel = label ? { ...result, label } : result;
  const resultWithOps =
    opsWithSource && opsWithSource?.length > 0
      ? { ...resultWithLabel, operations: opsWithSource }
      : resultWithLabel;

  return resultWithOps;
};

export const exportPadToURLString = (pad: Pad): string | undefined => {
  const json = exportPadToJSON(pad);
  if (!json) {
    return undefined;
  }

  const { id, operations } = json;

  // reapply the source as an op, taking care
  // to clear existing source ops
  const sourceUrl = getPadSourceUrl(pad);
  const filteredOps = operations?.filter(
    (op) => op.type !== OperationType.Source
  );
  const sourceOps = sourceUrl
    ? [{ type: OperationType.Source, url: sourceUrl }, ...(filteredOps ?? [])]
    : filteredOps;

  const label = getPadLabel(pad);
  const filteredLabelOps = sourceOps?.filter(
    (op) => op.type !== OperationType.Label
  );
  const labelOps = label
    ? [{ type: OperationType.Label, label }, ...(filteredLabelOps ?? [])]
    : filteredLabelOps;

  const ops =
    labelOps?.reduce((acc, op) => {
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
    .split('+')
    .map(importOperationFromURL)
    .filter(Boolean) as OperationExport[];

  const labelOp = ops.find((op) => op.type === OperationType.Label);
  const filteredOps = ops.filter((op) => op.type !== OperationType.Label);

  const label = (labelOp as LabelOperation | undefined)?.label;

  // const source = ops.find((op) => op.type === OperationType.Source);
  // const sourceUrl = (source as SourceOperation | undefined)?.url;
  // const filteredOps = source
  //   ? ops.filter((op) => op.type !== OperationType.Source)
  //   : ops;

  const result = {
    id,
    operations: filteredOps
  };

  return label ? { ...result, label } : result;
};

export const exportPadToClipboard = (pad: Pad) => {
  const json = exportPadToJSON(pad);
  if (!json) {
    return '';
  }
  const { source } = json;

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
