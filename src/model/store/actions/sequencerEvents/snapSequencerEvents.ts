// import { createLog } from '@helpers/log';
import { joinEvents, quantizeEvents } from '@model/sequencerEvent';
import { updateSequencer } from '@model/store/actions/helpers';
import { SnapSequencerEventsAction, StoreContext } from '@model/store/types';

// const log = createLog('sequencerEvents/moveSequencerEvents');

export const snapSequencerEvents = (
  context: StoreContext,
  action: SnapSequencerEventsAction
): StoreContext => {
  const { step } = action;
  const events = context.sequencer?.events ?? [];

  const selectedEvents = events.filter((evt) => !!evt.isSelected);

  if (selectedEvents.length === 0) {
    return context;
  }

  // log.debug('[moveSequencerEvents]', `selectedEvents:${selectedEvents.length}`);

  // const movedEvents = selectedEvents.map((evt) => ({
  //   ...evt,
  //   time: Math.max(0, evt.time + timeDelta),
  //   padId: rowIndexToPadId(Math.max(0, padIdToRowIndex(evt.padId) + rowDelta))
  // }));

  const snappedEvents = quantizeEvents(selectedEvents, step, false);

  const newEvents = joinEvents([...snappedEvents, ...events]);

  return updateSequencer(context, { events: newEvents });
};
