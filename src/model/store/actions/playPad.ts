import { getPadSourceUrl } from '@model/pad';
import { Emit, PlayPadAction, StoreContext } from '@model/store/types';

export const playPad = (
  context: StoreContext,
  event: PlayPadAction,
  { emit }: Emit
): StoreContext => {
  const { padId } = event;

  const pad = context.pads.find((pad) => pad.id === padId);
  if (!pad) {
    return context;
  }

  const url = getPadSourceUrl(pad) ?? '';

  emit({ type: 'playPad', pad });

  return context;
};
