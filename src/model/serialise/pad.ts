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
  Operation,
  OperationExport,
  OperationType,
  Pad,
  PadExport
} from '@model/types';
import {
  createPad,
  getPadInterval,
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
  options?: ImportPadFromJSONOptions;
}

export interface ImportPadFromJSONOptions {
  importSource?: boolean;
}

const log = createLog('model/serialise/pad', ['debug']);

export const importPadFromJSON = ({
  pad,
  options = { importSource: false }
}: ImportPadFromJSONProps): Pad | undefined => {
  if (!pad) {
    return undefined;
  }

  const operations = pad.operations
    ?.map(importOperationFromJSON)
    .filter(Boolean) as Operation[];

  return {
    id: pad.id,
    pipeline: {
      source: options.importSource
        ? {
            type: OperationType.Source,
            url: pad.source
          }
        : undefined,
      operations
    }
  };
};

export const exportPadToJSON = (pad: Pad): PadExport | undefined => {
  const { id, pipeline } = pad;

  const { source, operations } = pipeline;

  if (!source) {
    return undefined;
  }

  const ops = operations
    ?.map(exportOperationToJSON)
    .filter(Boolean) as OperationExport[];

  return {
    id,
    source: source.url,
    operations: ops?.length > 0 ? ops : undefined
  };
};

export const exportPadToURLString = (pad: Pad): string | undefined => {
  const json = exportPadToJSON(pad);
  if (!json) {
    return undefined;
  }

  const { id, source, operations } = json;

  const ops =
    operations?.reduce((acc, op) => {
      const url = exportOperationToURL(op);
      if (url) {
        acc.push(url);
      }
      return acc;
    }, [] as string[]) ?? [];

  const opsURL = ops.join('+') ?? '';

  const sourceStr = encodeURIComponent(source);

  return `${id}[${sourceStr}[${opsURL}`;
};

export const importPadFromURLString = (
  urlString: string
): PadExport | undefined => {
  const [id, sourceStr, opsStr] = urlString.split('[');

  const source = decodeURIComponent(sourceStr);

  log.debug('[importPadFromURLString] opsStr:', { id, sourceStr, opsStr });

  const ops = opsStr
    .split('+')
    .map(importOperationFromURL)
    .filter(Boolean) as OperationExport[];

  return {
    id,
    source,
    operations: ops.length > 0 ? ops : undefined
  };
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
    const url = new URL(source);

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
  options: ImportPadFromJSONOptions = { importSource: true }
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
    return imported ? importPadFromJSON({ pad: imported, options }) : undefined;
  }

  const padUrlData = parsePadUrl(urlString);

  if (padUrlData) {
    const imported = padUrlData.data
      ? importPadFromURLString(padUrlData.data)
      : undefined;
    return imported ? importPadFromJSON({ pad: imported, options }) : undefined;
  }

  // if (urlString.startsWith('odgn-vo://pad')) {
  //   const url = new URL(urlString);
  //   const data = url.searchParams.get('d');
  //   const imported = data ? importPadFromURLString(data) : undefined;
  //   return imported ? importPadFromJSON({ pad: imported, options }) : undefined;
  // }

  return undefined;
};
