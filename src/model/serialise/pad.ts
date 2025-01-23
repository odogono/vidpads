import { createLog } from '@helpers/log';
import { isYouTubeUrl, isYouTubeVideoId } from '@helpers/youtube';
import {
  Interval,
  Operation,
  OperationExport,
  OperationType,
  Pad,
  PadExport
} from '@model/types';
import { getPadStartAndEndTime } from '../pad';
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

const log = createLog('model/serialise/pad');

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

export const exportPadToJSON = (
  pad: Pad,
  urlToExternalUrlMap: Record<string, string> = {}
): PadExport | undefined => {
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
    source: urlToExternalUrlMap[source.url] ?? source.url,
    operations: ops?.length > 0 ? ops : undefined
  };
};

export const exportPadToURLString = (
  pad: Pad,
  urlToExternalUrlMap: Record<string, string> = {}
): string | undefined => {
  const json = exportPadToJSON(pad, urlToExternalUrlMap);
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

export const exportPadToClipboard = (
  pad: Pad,
  urlToExternalUrlMap: Record<string, string> = {}
) => {
  const json = exportPadToJSON(pad, urlToExternalUrlMap);
  if (!json) {
    return '';
  }
  const { source } = json;

  const data = exportPadToURLString(pad, urlToExternalUrlMap);

  if (isYouTubeVideoId(source)) {
    const { start } = getPadStartAndEndTime(pad, {
      start: -1,
      end: -1
    }) as Interval;

    // build a url with the start time and and the data
    const url = new URL(`https://youtu.be/${source}`);

    if (start !== -1) {
      url.searchParams.set('t', Math.round(start).toString());
    }
    if (data) {
      url.searchParams.set('x-vop-data', data);
    }

    return url.toString();
  }

  const url = new URL(`odgn-vo://pad`);
  if (data) {
    url.searchParams.set('d', data);
  }
  return url.toString();
};

export const importPadFromClipboard = (
  urlString: string,
  options: ImportPadFromJSONOptions = { importSource: true }
): Pad | undefined => {
  if (!urlString) {
    return undefined;
  }

  if (isYouTubeUrl(urlString)) {
    const url = new URL(urlString);
    const data = url.searchParams.get('x-vop-data');
    const imported = data ? importPadFromURLString(data) : undefined;
    return imported ? importPadFromJSON({ pad: imported, options }) : undefined;
  }

  if (urlString.startsWith('odgn-vo://pad')) {
    const url = new URL(urlString);
    const data = url.searchParams.get('d');
    const imported = data ? importPadFromURLString(data) : undefined;
    return imported ? importPadFromJSON({ pad: imported, options }) : undefined;
  }

  return undefined;
};
