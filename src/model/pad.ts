import {
  Interval,
  OperationType,
  Pad,
  TrimOperation,
  VolumeOperation
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

export const exportToURL = (pad: Pad): string => {
  return `vidpads://${pad.id}`;
};

export const copyPad = (pad: Pad): Pad => {
  return JSON.parse(JSON.stringify(pad));
};

export const getPadSourceUrl = (pad?: Pad | undefined): string | undefined => {
  return pad?.pipeline.source?.url;
};

export const getPadVolume = (pad: Pad | undefined, defaultTo: number = 1) => {
  if (!pad) {
    return defaultTo;
  }

  const operation = getPadOperation(pad, OperationType.Volume);

  if (!operation) {
    return defaultTo;
  }

  const { envelope } = operation as VolumeOperation;

  if (!envelope || envelope.length === 0) {
    return defaultTo;
  }

  const lastVolume = envelope[envelope.length - 1];

  return lastVolume.value;
};

export const getPadStartAndEndTime = (
  pad: Pad | undefined,
  defaultTo?: Interval | undefined
): Interval | undefined => {
  if (!pad) {
    return defaultTo;
  }

  const trimOperation = getPadOperation(pad, OperationType.Trim) as
    | TrimOperation
    | undefined;

  if (!trimOperation) {
    return defaultTo;
  }

  return {
    start: trimOperation.start,
    end: trimOperation.end
  };
};

export const getPadOperation = (pad: Pad, type: OperationType) => {
  return pad.pipeline?.operations?.find((operation) => operation.type === type);
};
