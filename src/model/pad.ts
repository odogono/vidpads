import {
  Operation,
  OperationExport,
  OperationType,
  Pad,
  PadExport,
  TrimOperation
} from './types';

export const createPad = (id: string): Pad => {
  return {
    id,
    pipeline: {
      source: undefined,
      operations: []
    }
  };
};

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
    operations: ops.length > 0 ? ops : undefined
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
  const ops = operations
    ?.map(exportOperationToJSON)
    .filter(Boolean) as OperationExport[];
  const opsURL = ops.join(':');

  return `${id}|${source}|${opsURL}`;
};

export const exportOperationToJSON = (
  operation: Operation | undefined
): OperationExport | undefined => {
  if (!operation) {
    return undefined;
  }

  if (operation.type === OperationType.Trim) {
    const { start, end } = operation as TrimOperation;
    return {
      type: operation.type,
      start: trimNumberToDecimalPlaces(start, 2),
      end: trimNumberToDecimalPlaces(end, 2)
    } as TrimOperation;
  }

  return undefined;
};

export const importOperationFromJSON = (
  operation: OperationExport | undefined
): Operation | undefined => {
  if (!operation) {
    return undefined;
  }

  if (operation.type === OperationType.Trim) {
    const { start, end } = operation as TrimOperation;
    return { type: OperationType.Trim, start, end } as TrimOperation;
  }

  return undefined;
};

export const exportOperationToURL = (
  operation: Operation | undefined
): string | undefined => {
  if (!operation) {
    return '';
  }

  if (operation.type === OperationType.Trim) {
    const { start, end } = operation as TrimOperation;
    return `${operation.type}:${trimNumberToDecimalPlaces(start, 2)}:${trimNumberToDecimalPlaces(end, 2)}`;
  }

  return '';
};

const trimNumberToDecimalPlaces = (number: number, places: number): number => {
  return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
};

export const exportToURL = (pad: Pad): string => {
  return `vidpads://${pad.id}`;
};

export const copyPad = (pad: Pad): Pad => {
  return JSON.parse(JSON.stringify(pad));
};

export const getPadSourceUrl = (pad?: Pad | undefined): string | undefined => {
  return pad?.pipeline.source?.url;
};

export const getPadStartAndEndTime = (pad: Pad) => {
  const trimOperation = getPadOperation(pad, OperationType.Trim) as
    | TrimOperation
    | undefined;

  if (!trimOperation) {
    return {
      start: -1,
      end: -1
    };
  }

  return {
    start: trimOperation.start,
    end: trimOperation.end
  };
};

export const applyPadTrimOperation = (
  pad: Pad,
  start: number,
  end: number
): Pad => {
  const newOp: TrimOperation = {
    type: OperationType.Trim,
    start,
    end
  };

  const existingTrimOperation = getPadOperation(pad, OperationType.Trim);

  if (!existingTrimOperation) {
    return {
      ...pad,
      pipeline: {
        ...pad.pipeline,
        operations: [...pad.pipeline.operations, newOp]
      }
    };
  }

  // replace the old trim operation with the new one
  const newOperations = pad.pipeline.operations.reduce((acc, op) => {
    if (op.type === OperationType.Trim) {
      return [...acc, newOp];
    }
    return [...acc, op];
  }, [] as Operation[]);

  return {
    ...pad,
    pipeline: {
      ...pad.pipeline,
      operations: newOperations
    }
  };
};

export const getPadOperation = (pad: Pad, type: OperationType) => {
  return pad.pipeline.operations.find((operation) => operation.type === type);
};
