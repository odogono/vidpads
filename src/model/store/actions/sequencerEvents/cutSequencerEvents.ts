import { joinEvents, splitEvents } from '@model/sequencerEvent';
import { exportSequencerEventsToJSON } from '@model/serialise/sequencer';
import { updateSequencer } from '@model/store/actions/helpers';
import { StoreContext } from '@model/store/types';

// const log = createLog('sequencerEvents/moveSequencerEvents');

export const cutSequencerEvents = (context: StoreContext): StoreContext => {
  const events = context.sequencer?.events ?? [];
  const [selectedEvents, nonSelectedEvents] = splitEvents(
    events,
    (evt) => !!evt.isSelected
  );

  const clipboard = JSON.stringify(exportSequencerEventsToJSON(selectedEvents));

  const newEvents = joinEvents([...nonSelectedEvents]);

  return updateSequencer(context, { events: newEvents, clipboard });
};
