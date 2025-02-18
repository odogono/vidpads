import { dateToISOString } from '@helpers/datetime';
import { ProjectStoreContext } from '@model/store/types';
import { Pad } from '@model/types';

export const findPadById = (
  context: ProjectStoreContext,
  padId: string
): Pad | undefined => context.pads.find((pad) => pad.id === padId);

export const addOrReplacePad = (
  context: ProjectStoreContext,
  pad?: Pad | undefined
): ProjectStoreContext => {
  if (!pad) return context;

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
  context: ProjectStoreContext,
  additional: Partial<ProjectStoreContext>
) => ({
  ...context,
  ...additional,
  updatedAt: dateToISOString()
});

export const updateSequencer = (
  context: ProjectStoreContext,
  newSequencer: Partial<ProjectStoreContext['sequencer']>
) => {
  return update(context, {
    sequencer: {
      ...context.sequencer,
      ...newSequencer
    }
  });
};

export const updateStepSequencer = (
  context: ProjectStoreContext,
  newSequencer: Partial<ProjectStoreContext['stepSequencer']>
) => {
  return update(context, {
    stepSequencer: {
      ...context.stepSequencer,
      ...newSequencer
    }
  });
};
