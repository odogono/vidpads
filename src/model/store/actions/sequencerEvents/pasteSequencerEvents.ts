// import { joinEvents, splitEvents } from '@model/sequencerEvent';
import { joinEvents, translateEvents } from '@model/sequencerEvent';
import { importSequencerEventsFromJSON } from '@model/serialise/sequencer';
import { updateSequencer } from '@model/store/actions/helpers';
import { PasteSequencerEventsAction, StoreContext } from '@model/store/types';

// const log = createLog('sequencerEvents/moveSequencerEvents');

export const pasteSequencerEvents = (
  context: StoreContext,
  action: PasteSequencerEventsAction
): StoreContext => {
  const { time, padId } = action;
  const events = context.sequencer?.events ?? [];
  const clipboard = context.sequencer?.clipboard ?? '';

  if (!clipboard) {
    return context;
  }

  const pastedEvents = importSequencerEventsFromJSON(JSON.parse(clipboard));

  const translatedEvents = translateEvents(pastedEvents, time, padId);

  const newEvents = joinEvents([...translatedEvents, ...events]);

  return updateSequencer(context, { events: newEvents });
};
