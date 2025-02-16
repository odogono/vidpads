// import { createLog } from '@helpers/log';
import { getIntersectingEvents } from '@model/sequencerEvent';
import { updateSequencer } from '@model/store/actions/helpers';
import {
  ProjectStoreContext,
  SelectSequencerEventsAction
} from '@model/store/types';

// const log = createLog('sequencerEvents/moveSequencerEvents');
export const selectSequencerEvents = (
  context: ProjectStoreContext,
  action: SelectSequencerEventsAction
): ProjectStoreContext => {
  const { evtIds, padIds, time, duration } = action;
  const events = context.sequencer?.events ?? [];

  if (evtIds) {
    const newEvents = events.map((evt) => ({
      ...evt,
      isSelected: evtIds.includes(evt.id)
    }));
    return updateSequencer(context, { events: newEvents });
  }

  const intersectingEvents = getIntersectingEvents(
    events,
    time,
    duration,
    padIds
  );

  const newEvents = events.map((evt) => ({
    ...evt,
    isSelected: intersectingEvents.includes(evt)
  }));

  return updateSequencer(context, { events: newEvents });
};
