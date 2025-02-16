import { createLog } from '@helpers/log';
import { joinEvents, repeatEvents, splitEvents } from '@model/sequencerEvent';
import { ProjectStoreContext } from '@model/store/types';
import { updateSequencer } from '../helpers';

const log = createLog('sequencerEvents/repeatSequencerEvents');

export const repeatSequencerEvents = (
  context: ProjectStoreContext
): ProjectStoreContext => {
  const events = context.sequencer?.events ?? [];
  const endTime = context.sequencer?.endTime ?? 30;

  const [selectedEvents, nonSelectedEvents] = splitEvents(
    events,
    (evt) => !!evt.isSelected
  );

  log.debug('repeatSequencerEvents', selectedEvents.length);

  if (selectedEvents.length === 0) {
    return context;
  }

  // create copies of the selected events
  const repeatedEvents = repeatEvents(selectedEvents, endTime);

  // add them to the selected set
  const selectedRepeatedEvents = repeatedEvents.map((evt) => ({
    ...evt,
    isSelected: true
  }));

  // join the selected and non-selected events
  const newEvents = joinEvents([
    ...selectedEvents,
    ...selectedRepeatedEvents,
    ...nonSelectedEvents
  ]);

  return updateSequencer(context, { events: newEvents });
};
