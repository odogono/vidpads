// import { createLog } from '@helpers/log';
import {
  joinEvents,
  mergeEvents,
  padIdToRowIndex,
  rowIndexToPadId
} from '@model/sequencerEvent';
import { updateSequencer } from '@model/store/actions/helpers';
import {
  MoveSequencerEventsAction,
  ProjectStoreContext
} from '@model/store/types';

// const log = createLog('sequencerEvents/moveSequencerEvents');

export const moveSequencerEvents = (
  context: ProjectStoreContext,
  action: MoveSequencerEventsAction
): ProjectStoreContext => {
  const { timeDelta, rowDelta, isFinished } = action;
  const events = context.sequencer?.events ?? [];

  const selectedEvents = events.filter((evt) => !!evt.isSelected);

  if (selectedEvents.length === 0) {
    return context;
  }

  // log.debug('[moveSequencerEvents]', `selectedEvents:${selectedEvents.length}`);

  const movedEvents = selectedEvents.map((evt) => ({
    ...evt,
    time: Math.max(0, evt.time + timeDelta),
    padId: rowIndexToPadId(Math.max(0, padIdToRowIndex(evt.padId) + rowDelta))
  }));

  // const quantizedEvents = isFinished
  //   ? quantizeEvents(movedEvents, 4, false)
  //   : movedEvents;

  const newEvents = isFinished
    ? joinEvents([...movedEvents, ...events])
    : mergeEvents(...movedEvents, ...events);

  // if (isFinished) {
  //   log.debug(
  //     '[moveSequencerEvents]',
  //     'finished',
  //     events.length,
  //     newEvents.length
  //   );
  //   for (const evt of newEvents) {
  //     log.debug('newEvents', JSON.stringify(evt));
  //   }
  // }

  return updateSequencer(context, { events: newEvents });
};
