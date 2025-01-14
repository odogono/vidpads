import { Operation, OperationType, Pad, TrimOperation } from './types';

export const createPad = (id: string): Pad => {
  return {
    id,
    pipeline: {
      source: undefined,
      operations: []
    }
  };
};

export const exportPadToJSON = (
  pad: Pad,
  urlToExternalUrlMap: Record<string, string> = {}
): object | undefined => {
  const { id, pipeline } = pad;

  const { source, operations } = pipeline;

  if (!source) {
    return undefined;
  }

  return {
    id,
    source: urlToExternalUrlMap[source.url] ?? source.url,
    operations: operations.map(exportOperationToJSON)
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

  return `${id}|${source}|${operations.map(exportOperationToURL).join('|')}`;
};

export const exportOperationToJSON = (
  operation: Operation | undefined
): object | undefined => {
  if (!operation) {
    return undefined;
  }

  if (operation.type === OperationType.Trim) {
    const { start, end } = operation as TrimOperation;
    return {
      type: operation.type,
      start: trimNumberToDecimalPlaces(start, 2),
      end: trimNumberToDecimalPlaces(end, 2)
    };
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
