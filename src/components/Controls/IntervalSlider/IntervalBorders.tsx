import { Rect } from '@types';
import { INTERVAL_BORDER_WIDTH } from './constants';

interface IntervalBordersProps {
  intervalStartX: number;
  intervalEndX: number;
  trackArea: Rect;
}

export const IntervalBorders = ({
  intervalStartX,
  intervalEndX,
  trackArea
}: IntervalBordersProps) => {
  return (
    <>
      <div
        className='absolute'
        style={{
          backgroundColor: 'var(--c7)',
          top: 0,
          left: intervalStartX,
          width: intervalEndX - intervalStartX,
          height: INTERVAL_BORDER_WIDTH
        }}
      />
      <div
        className='absolute'
        style={{
          backgroundColor: 'var(--c7)',
          top: trackArea.y + trackArea.height,
          left: intervalStartX,
          width: intervalEndX - intervalStartX,
          height: INTERVAL_BORDER_WIDTH
        }}
      />
    </>
  );
};
