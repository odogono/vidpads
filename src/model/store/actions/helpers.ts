import { StoreContext } from '@model/store/types';
import { Operation, Pad } from '@model/types';

export const findPadById = (
  context: StoreContext,
  padId: string
): Pad | undefined => context.pads.find((pad) => pad.id === padId);

export const addOrReplacePad = (
  context: StoreContext,
  pad: Pad
): StoreContext => {
  const padIndex = context.pads.findIndex((p) => p.id === pad.id);
  const pads = [...context.pads];

  if (padIndex === -1) {
    // Pad not found, add it to the end
    pads.push(pad);
  } else {
    // Replace existing pad at same position
    pads[padIndex] = pad;
  }

  return update(context, { pads });
};

export const update = (
  context: StoreContext,
  additional: Partial<StoreContext>
) => ({
  ...context,
  ...additional,
  updatedAt: new Date().toISOString()
});

/**
 * Adds or replaces an operation in the pad's pipeline.
 *
 * @param pad - The pad to add or replace the operation in.
 * @param operation - The operation to add or replace.
 * @returns The new pipeline operations.
 */
export const addOrReplaceOperation = (pad: Pad, operation: Operation): Pad => {
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
