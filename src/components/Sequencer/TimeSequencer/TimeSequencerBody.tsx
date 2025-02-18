'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { showError } from '@helpers/toast';
import { useTimeSequencer } from '@hooks/useTimeSequencer';
import { getPadDuration } from '@model/pad';
import { createSequencerEvent, quantizeSeconds } from '@model/sequencerEvent';
import { Pad, SequencerEvent } from '@model/types';
import { Position, Rect } from '@types';
import { EventTooltip } from './components/EventTooltip';
import { Header } from './components/Header';
import { Marquee } from './components/Marquee';
import { PlayHead } from './components/PlayHead';
import { Row } from './components/Row';
import { pixelsToSeconds, secondsToPixels } from './helpers/timeConversion';
import { useEventTooltip } from './hooks/useEventTooltip';
import { useGridDimensions } from './hooks/useGridDimensions';
import { useMarquee } from './hooks/useMarquee';
import { useSelectedEventsRect } from './hooks/useSelectedEventsRect';
import { useSequencerEvents } from './hooks/useSequencerEvents';

const log = createLog('TimeSequencerBody', ['debug']);

export interface SequencerBodyProps {
  canvasBpm?: number;
  pixelsPerBeat?: number;
  pads: Pad[];
}

export const TimeSequencerBody = ({
  canvasBpm = 60,
  pixelsPerBeat = 16,
  pads
}: SequencerBodyProps) => {
  const padCount = pads.length;
  const bodyRef = useRef<HTMLDivElement>(null);

  const { gridRef, getGridDimensions } = useGridDimensions({ padCount });

  const {
    tooltipPosition,
    isTooltipVisible,
    setTooltipPosition,
    setIsTooltipVisible
  } = useEventTooltip();

  const {
    bpm,
    seqEvents,
    seqEventIds,
    moveEvents,
    addEvent,
    getEventsAtTime,
    selectEvents,
    selectEventsAtTime,
    seqSelectedEvents,
    seqSelectedEventIds,
    time,
    endTime,
    setTime,
    repeatEvents,
    cutEvents,
    copyEvents,
    snapEvents,
    pasteEvents
  } = useTimeSequencer();
  const [playHeadPosition, setPlayHeadPosition] = useState(
    secondsToPixels(time, pixelsPerBeat, bpm)
  );

  const timelineDurationInPixels =
    secondsToPixels(endTime, pixelsPerBeat, bpm) + pixelsPerBeat;

  // log.debug('timelineDurationInPixels', {
  //   timelineDurationInPixels,
  //   endTime,
  //   pixelsPerBeat,
  //   bpm
  // });
  useSequencerEvents({
    seqEvents,
    seqEventIds,
    setPlayHeadPosition,
    pixelsPerBeat,
    bpm,
    canvasBpm
  });

  const selectedEventsRect: Rect = useSelectedEventsRect({
    getGridDimensions,
    padCount,
    seqSelectedEvents,
    pixelsPerBeat,
    canvasBpm,
    seqSelectedEventIds
  });

  useEffect(() => {
    if (seqSelectedEventIds.length > 0) {
      const bodyRect = bodyRef.current?.getBoundingClientRect();
      if (!bodyRect) return;
      // log.debug('seqSelectedEventIds', seqSelectedEventIds);
      // Position tooltip above the selected events rect
      const { x, y } = selectedEventsRect;
      setTooltipPosition({
        x: bodyRect.x + x + selectedEventsRect.width / 2, // Center horizontally
        y: bodyRect.y + y - 12 // Position slightly above the rect
      });
      setIsTooltipVisible(true);
    } else {
      setIsTooltipVisible(false);
    }
  }, [
    seqSelectedEventIds,
    selectedEventsRect,
    setTooltipPosition,
    setIsTooltipVisible
  ]);

  const convertGridRectToTime = useCallback(
    (rect: Rect) => {
      const x = Math.max(0, rect.x - 10);
      const time = pixelsToSeconds(x, pixelsPerBeat, canvasBpm);
      const duration = pixelsToSeconds(rect.width, pixelsPerBeat, canvasBpm);

      const { rowHeight } = getGridDimensions();
      const startRowIndex = Math.floor(rect.y / rowHeight) - 1;
      const endRowIndex = Math.floor((rect.y + rect.height) / rowHeight) - 1;

      const padIds = Array.from(
        { length: endRowIndex - startRowIndex + 1 },
        (_, index) => `a${startRowIndex + index + 1}`
      );

      return { time, duration, padIds };
    },
    [pixelsPerBeat, canvasBpm, getGridDimensions]
  );

  const convertYToPadId = useCallback(
    (y: number) => {
      const { rowHeight } = getGridDimensions();
      const rowIndex = Math.floor(y / rowHeight) - 1;
      return { rowIndex, padId: `a${rowIndex + 1}` };
    },
    [getGridDimensions]
  );

  const handleMarqueeSelectEnd = useCallback(
    (rect: Rect, isFinished?: boolean, isLongPress?: boolean) => {
      const { time, duration, padIds } = convertGridRectToTime(rect);

      const hasSelectedEvents = seqSelectedEventIds.length > 0;

      // log.debug('handleMarqueeSelectEnd', {
      //   isFinished,
      //   hasSelectedEvents,
      //   isLongPress
      // });

      if (isFinished && !isLongPress) {
        if (rect.width <= 5 && rect.height <= 5) {
          if (hasSelectedEvents) {
            // deselect all events
            selectEventsAtTime([], -1, -1);
          } else {
            const eventsAtTime = getEventsAtTime(padIds[0], time);

            if (eventsAtTime.length > 0) {
              // const lastEvent = eventsAtTime[eventsAtTime.length - 1];
              // const evtDuration = lastEvent?.duration ?? 0.5;
              // setLastEventDuration(evtDuration);
              // log.debug('handleMarqueeSelectEnd select', time, eventsAtTime);
              // selectEvents(eventsAtTime, lastEvent.time, evtDuration);
              selectEvents(eventsAtTime.slice(0, 1));
            } else {
              if (!isTooltipVisible) {
                // add the event with the duration of the pad
                const pad = pads.find((p) => p.id === padIds[0]);
                const duration = getPadDuration(pad);

                if (duration <= 0) {
                  showError(`Pad ${padIds[0]} has no duration`);
                  return;
                }

                addEvent(
                  createSequencerEvent({
                    padId: padIds[0],
                    time: quantizeSeconds(time, 4),
                    duration
                  })
                );
              }
            }
          }
        } else {
          // log.debug('handleMarqueeSelectEnd', { time, duration, padIds });
          // Normal marquee selection
          selectEventsAtTime(padIds, time, duration);
        }
      }
      setIsTooltipVisible(false);
    },
    [
      convertGridRectToTime,
      seqSelectedEventIds.length,
      setIsTooltipVisible,
      selectEventsAtTime,
      getEventsAtTime,
      selectEvents,
      isTooltipVisible,
      pads,
      addEvent
    ]
  );

  const lastPressPosition = useRef({ time: 0, padId: '' });

  const handleLongPressDown = useCallback(
    (rect: Rect, isFinished?: boolean) => {
      if (isFinished) {
        const { time, duration, padIds } = convertGridRectToTime({
          ...rect,
          width: 1,
          height: 1
        });
        const bodyRect = bodyRef.current?.getBoundingClientRect();
        if (!bodyRect) return;
        log.debug('handleLongPressDown', rect, { time, duration, padIds });
        // Position tooltip above the selected events rect
        const { x, y } = rect;
        setTooltipPosition({
          x: bodyRect.x + x, // Center horizontally
          y: bodyRect.y + y - 12 // Position slightly above the rect
        });
        lastPressPosition.current = { time, padId: padIds[0] };
        setIsTooltipVisible(true);
        // selectEventsAtTime(padIds, time, duration);
      }
    },
    [convertGridRectToTime, setIsTooltipVisible, setTooltipPosition]
  );

  const handlePaste = useCallback(() => {
    pasteEvents(
      lastPressPosition.current.time,
      lastPressPosition.current.padId
    );
  }, [pasteEvents]);

  const moveRowIndex = useRef(-1);
  const handleMarqueeMoveUpdate = useCallback(
    (pos: Position, start: Position, isFinished?: boolean) => {
      // log.debug('[handleMarqueeMoveUpdate]', {
      //   pos: pos.x,
      //   start: start.x,
      //   isFinished
      // });
      // convert pos to ms
      const time = pixelsToSeconds(pos.x, pixelsPerBeat, canvasBpm);

      // const startRowIndex = convertYToPadId(start.y).rowIndex;
      const currentRowIndex = convertYToPadId(start.y + pos.y).rowIndex;

      if (moveRowIndex.current === -1) {
        moveRowIndex.current = currentRowIndex;
      }
      const rowDelta = currentRowIndex - moveRowIndex.current;

      moveRowIndex.current = currentRowIndex;
      // const { rowIndex, padId } = convertYToPadId(start.y + pos.y);
      // const quantizedTime = quantizeSeconds(time, 0.5);

      // if (rowDelta !== 0)
      //   log.debug(
      //     'handleMarqueeMoveUpdate',
      //     { y: pos.y, sy: start.y, currentRowIndex, rowDelta },
      //     time,
      //     isFinished
      //   );

      // log.debug('[handleMarqueeMoveUpdate]', {
      //   isFinished,
      //   time,
      //   rowDelta
      // });
      moveEvents(isFinished ? 0 : time, rowDelta, isFinished);

      if (isFinished) {
        moveRowIndex.current = -1;
      }
    },
    [canvasBpm, convertYToPadId, moveEvents, pixelsPerBeat]
  );

  const {
    marqueeStart,
    marqueeEnd,
    isDragging,
    isLongTouch,
    ...marqueeEvents
  } = useMarquee({
    onLongPressDown: handleLongPressDown,
    onSelectUpdate: (rect: Rect, isFinished?: boolean) =>
      handleMarqueeSelectEnd(rect, isFinished, isLongTouch),
    onMoveUpdate: handleMarqueeMoveUpdate,
    hasSelectedEvents: seqSelectedEventIds.length > 0,
    selectedEventsRect
  });

  const rows = useMemo(() => {
    return Array.from({ length: padCount }, (_, index) => {
      const events = seqEvents.filter((e) => e.padId === `a${index + 1}`);
      const rowEvents = events.map((e: SequencerEvent) => {
        const { time, duration } = e;
        // convert time to ms
        const x = secondsToPixels(time, pixelsPerBeat, canvasBpm);
        // and back to pixels so we get the scaling right
        const width = secondsToPixels(duration, pixelsPerBeat, canvasBpm);
        // if (inProgress) {
        //   log.debug('rowEvents', { ...e, x, width });
        // }
        return { ...e, x, width };
      });
      // log.debug(
      //   'rowEvents',
      //   `a${index + 1}`,
      //   rowEvents.length,
      //   sequencerEvents.length
      // );
      return (
        <Row
          key={`row-${index}`}
          rowIndex={index}
          padId={`a${index + 1}`}
          // onTap={handleRowTap}
          // onEventDrop={handleEventDrop}
          events={rowEvents}
        />
      );
    });
    // stop constant re-rendering from sequencerEvents
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasBpm, padCount, pixelsPerBeat, seqEventIds]);

  const handlePlayHeadMove = useCallback(
    (pos: Position) => {
      const time = pixelsToSeconds(pos.x, pixelsPerBeat, bpm);
      // log.debug('handlePlayHeadMove', { x: pos.x, time });
      setTime(time);
    },
    [bpm, pixelsPerBeat, setTime]
  );

  return (
    <div
      ref={bodyRef}
      className={`vo-seq-body relative h-full pointer-events-none`}
      style={{ width: timelineDurationInPixels }}
    >
      <PlayHead position={playHeadPosition} onMove={handlePlayHeadMove} />
      <Marquee start={marqueeStart} end={marqueeEnd} isDragging={isDragging} />
      <div
        ref={gridRef}
        className='vo-seq-grid grid grid-cols-2 w-full h-full pointer-events-auto'
        style={{
          gridTemplateColumns: `10px 1fr`,
          gridTemplateRows: `1fr repeat(${padCount}, 1fr) 0.2fr` // if this changes, then update totalFr
        }}
        {...marqueeEvents}
      >
        <Header
          pixelsPerBeat={pixelsPerBeat}
          endTime={endTime}
          onTap={handlePlayHeadMove}
        />
        {rows}
        <div
          className='vo-seq-selected-evts-rect absolute pointer-events-none bg-black opacity-20'
          style={{
            left: selectedEventsRect.x,
            top: selectedEventsRect.y,
            width: selectedEventsRect.width,
            height: selectedEventsRect.height
          }}
        />
      </div>
      <EventTooltip
        isVisible={isTooltipVisible}
        isEventsSelected={seqSelectedEventIds.length > 0}
        {...tooltipPosition}
        onCut={cutEvents}
        onCopy={copyEvents}
        onDupe={repeatEvents}
        onSnap={snapEvents}
        onPaste={handlePaste}
      />
    </div>
  );
};
