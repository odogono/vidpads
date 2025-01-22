import {
  Operation,
  OperationExport,
  OperationType,
  Pad,
  PadExport
} from '@model/types';
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
