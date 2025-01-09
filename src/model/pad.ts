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

export const getPadSourceUrl = (pad: Pad): string | undefined => {
  return pad.pipeline.source?.url;
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
