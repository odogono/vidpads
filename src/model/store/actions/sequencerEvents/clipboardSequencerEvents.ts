import {
  joinEvents,
  splitEvents,
  translateEvents
} from '@model/sequencerEvent';
import {
  exportSequencerEventsToJSON,
  importSequencerEventsFromJSON
} from '@model/serialise/sequencer';
import { updateSequencer } from '@model/store/actions/helpers';
import {
  ClipboardSequencerEventsAction,
  StoreContext
} from '@model/store/types';

export const clipboardSequencerEvents = (
  context: StoreContext,
  action: ClipboardSequencerEventsAction
): StoreContext => {
  const { op, time, padId } = action;
  const events = context.sequencer?.events ?? [];

  if (op === 'cut') {
    const [selectedEvents, nonSelectedEvents] = splitEvents(
      events,
      (evt) => !!evt.isSelected
    );

    const clipboard = JSON.stringify(
      exportSequencerEventsToJSON(selectedEvents)
    );

    const newEvents = joinEvents([...nonSelectedEvents]);

    return updateSequencer(context, { events: newEvents, clipboard });
  }

  if (op === 'copy') {
    const [selectedEvents] = splitEvents(events, (evt) => !!evt.isSelected);

    const clipboard = JSON.stringify(
      exportSequencerEventsToJSON(selectedEvents)
    );

    return updateSequencer(context, { clipboard });
  }

  if (op === 'paste') {
    const clipboard = context.sequencer?.clipboard ?? '';

    if (!clipboard) {
      return context;
    }

    const pastedEvents = importSequencerEventsFromJSON(JSON.parse(clipboard));

    const translatedEvents = translateEvents(
      pastedEvents,
      time ?? 0,
      padId ?? 'a1',
      { isSelected: true }
    );

    const newEvents = joinEvents([...translatedEvents, ...events]);

    return updateSequencer(context, { events: newEvents });
  }

  return context;
};
