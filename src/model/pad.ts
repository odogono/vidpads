import { roundNumberToDecimalPlaces } from '@helpers/number';
import {
  Interval,
  LoopOperation,
  Operation,
  OperationType,
  Pad,
  PlaybackOperation,
  PlaybackRateOperation,
  SourceOperation,
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

export const padIdToInteger = (padId: string) => {
  return (
    (Math.max(0, padId.charCodeAt(0) - 97) << 4) | parseInt(padId.slice(1))
  );
};

export const integerToPadId = (integer: number) => {
  const letter = String.fromCharCode((integer >> 4) + 97);
  const number = integer & 0x0f;
  return `${letter}${number}`;
};

export const setPadOperations = (
  pad: Pad | undefined,
  operations: Operation[]
) => {
  if (!pad) {
    return pad;
  }

  return { ...pad, pipeline: { ...pad.pipeline, operations } };
};

export const setPadSource = (
  pad: Pad | undefined,
  source: string | undefined
): Pad | undefined => {
  if (!pad) {
    return pad;
  }
  const op = { type: OperationType.Source, url: source ?? '' };

  return addOrReplacePadOperation(pad, op);
};

export const setPadLabel = (
  pad: Pad | undefined,
  label: string | undefined
): Pad | undefined => {
  if (!pad || !label) {
    return pad;
  }

  // const op = { type: OperationType.Label, label: label ?? '' };

  // return addOrReplacePadOperation(pad, op);
  return { ...pad, label };
};

export const setPadInterval = (
  pad: Pad | undefined,
  interval: Interval
): Pad | undefined => {
  if (!pad) {
    return pad;
  }

  const { start, end } = { ...{ start: 0, end: -1 }, ...interval };

  const newOp: TrimOperation = {
    type: OperationType.Trim,
    start: roundNumberToDecimalPlaces(start),
    end: roundNumberToDecimalPlaces(end)
  };

  return addOrReplacePadOperation(pad, newOp);
};

/**
 * Adds or replaces an operation in the pad's pipeline.
 *
 * @param pad - The pad to add or replace the operation in.
 * @param operation - The operation to add or replace.
 * @returns The new pipeline operations.
 */
export const addOrReplacePadOperation = (
  pad: Pad | undefined,
  operation: Operation
): Pad | undefined => {
  if (!pad) {
    return undefined;
  }

  const operations = pad.pipeline.operations ?? [];

  let isFound = false;
  const newOperations = operations.reduce((acc, op) => {
    if (op.type === operation.type) {
      isFound = true;
      return [...acc, operation];
    }
    return [...acc, op];
  }, [] as Operation[]);

  if (!isFound) {
    newOperations.push(operation);
  }

  return {
    ...pad,
    pipeline: {
      ...pad.pipeline,
      operations: newOperations
    }
  };
};

export const removePadOperation = (
  pad: Pad | undefined,
  type: OperationType
) => {
  if (!pad) {
    return pad;
  }

  const operations = pad.pipeline.operations ?? [];

  const newOperations = operations.filter(
    (operation) => operation.type !== type
  );

  return {
    ...pad,
    pipeline: { ...pad.pipeline, operations: newOperations }
  };
};

// export const exportToURL = (pad: Pad, projectId: string): string => {
//   return toPadThumbnailUrl(pad.id, projectId);
// };

export const copyPad = (pad: Pad): Pad => {
  return JSON.parse(JSON.stringify(pad));
};

export const getPadLabel = (pad?: Pad | undefined): string | undefined => {
  if (!pad) {
    return undefined;
  }

  return pad.label;
};

export const getPadSourceUrl = (pad?: Pad | undefined): string | undefined => {
  if (!pad) {
    return undefined;
  }

  const op = getPadOperation(pad, OperationType.Source);

  if (op) {
    return (op as SourceOperation).url;
  }

  const pipelineSrc = pad?.pipeline.source?.url;
  if (pipelineSrc) {
    return pipelineSrc;
  }

  return undefined;
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

  const { value } = lastVolume;

  if (value === undefined || value === null || isNaN(value)) {
    return defaultTo;
  }

  return value;
};

export const getPadInterval = (
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

  let { start, end } = trimOperation;

  if (start === -1 && defaultTo?.start !== undefined) {
    start = defaultTo.start;
  }

  if (end === -1 && defaultTo?.end !== undefined) {
    end = defaultTo.end;
  }

  return {
    start,
    end
  };
};

export const getPadPlaybackRate = (
  pad: Pad | undefined,
  defaultTo: number = 1
): number => {
  if (!pad) {
    return defaultTo;
  }

  const operation = getPadOperation(pad, OperationType.PlaybackRate);

  if (!operation) {
    return defaultTo;
  }

  const { rate } = operation as PlaybackRateOperation;

  return rate;
};

export const getPadOperation = (pad: Pad, type: OperationType) => {
  return pad.pipeline?.operations?.find((operation) => operation.type === type);
};

export const isPadLooped = (pad: Pad | undefined): boolean => {
  if (!pad) {
    return false;
  }

  const loopOperation = getPadOperation(pad, OperationType.Loop);

  if (!loopOperation) {
    return false;
  }

  return true;
};

export const setPadChokeGroup = (
  pad: Pad | undefined,
  chokeGroup: number | undefined
): Pad | undefined => {
  if (!pad) {
    return pad;
  }

  const op = getPadPlaybackOperation(pad);

  if (!op && !chokeGroup) {
    return pad;
  }

  const newOp = op
    ? { ...op, chokeGroup }
    : { type: OperationType.Playback, chokeGroup };

  return addOrReplacePadOperation(pad, newOp);
};

export const getPadChokeGroup = (pad: Pad | undefined): number | undefined => {
  if (!pad) {
    return undefined;
  }

  const op = getPadPlaybackOperation(pad);

  if (!op) {
    return undefined;
  }

  return op.chokeGroup;
};

export const setPadPlayPriority = (
  pad: Pad | undefined,
  playPriority: number | undefined
): Pad | undefined => {
  if (!pad) {
    return pad;
  }

  const op = getPadPlaybackOperation(pad);

  if (!op && !playPriority) {
    return pad;
  }

  const newOp = op
    ? { ...op, priority: playPriority }
    : { type: OperationType.Playback, priority: playPriority };

  return addOrReplacePadOperation(pad, newOp);
};

export const getPadPlayPriority = (
  pad: Pad | undefined
): number | undefined => {
  if (!pad) {
    return undefined;
  }

  const op = getPadPlaybackOperation(pad);

  if (!op) {
    return undefined;
  }

  return op.priority;
};

export const setPadLoop = (
  pad: Pad | undefined,
  start: number | undefined
): Pad | undefined => {
  if (!pad) {
    return pad;
  }

  if (start === undefined || start === -1) {
    return removePadOperation(pad, OperationType.Loop);
  }

  const op = {
    type: OperationType.Loop,
    start: roundNumberToDecimalPlaces(start)
  };
  return addOrReplacePadOperation(pad, op);
};

export const getPadLoopStart = (pad: Pad | undefined): number => {
  if (!pad) {
    return -1;
  }

  const op = getPadOperation(pad, OperationType.Loop) as
    | LoopOperation
    | undefined;

  if (!op) {
    return -1;
  }

  return op.start;
};

export const getPadPlaybackOperation = (
  pad: Pad | undefined
): PlaybackOperation | undefined => {
  if (!pad) {
    return undefined;
  }

  const op = getPadOperation(pad, OperationType.Playback) as
    | PlaybackOperation
    | undefined;

  if (isPadPlaybackOperationEmpty(op)) {
    return undefined;
  }

  return op;
};

export const isPadPlaybackOperationEmpty = (
  op: PlaybackOperation | undefined
): boolean => {
  if (!op) {
    return true;
  }

  if (!op.isOneShot && !op.priority && !op.chokeGroup && !op.resume) {
    return true;
  }

  return false;
};

export const setPadIsOneShot = (
  pad: Pad | undefined,
  isOneShot: boolean | undefined
): Pad | undefined => {
  if (!pad) {
    return pad;
  }

  const op = getPadPlaybackOperation(pad);

  if (!op && !isOneShot) {
    return pad;
  }

  const newOp = op
    ? { ...op, isOneShot }
    : { type: OperationType.Playback, isOneShot };

  return addOrReplacePadOperation(pad, newOp);
};

export const getPadIsOneShot = (pad: Pad | undefined): boolean => {
  if (!pad) {
    return false;
  }

  const op = getPadOperation(pad, OperationType.Playback);

  if (!op) {
    return false;
  }

  return (op as PlaybackOperation).isOneShot ?? false;
};

export const setPadPlaybackResume = (
  pad: Pad | undefined,
  resume: boolean | undefined
): Pad | undefined => {
  if (!pad) {
    return pad;
  }

  const op = getPadPlaybackOperation(pad);

  if (!op && !resume) {
    return pad;
  }

  const newOp = op
    ? { ...op, resume }
    : { type: OperationType.Playback, resume };

  return addOrReplacePadOperation(pad, newOp);
};

export const getPadPlaybackResume = (
  pad: Pad | undefined
): boolean | undefined => {
  if (!pad) {
    return undefined;
  }

  const op = getPadPlaybackOperation(pad);

  if (!op) {
    return undefined;
  }

  return (op as PlaybackOperation).resume;
};
