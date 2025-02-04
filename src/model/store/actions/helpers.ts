import { dateToISOString } from '@helpers/datetime';
import { StoreContext } from '@model/store/types';
import { Pad } from '@model/types';

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
  updatedAt: dateToISOString()
});
