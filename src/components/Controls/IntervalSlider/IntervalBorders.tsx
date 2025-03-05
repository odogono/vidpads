import { cn } from '@helpers/tailwind';
import { Rect } from '@types';
import { INTERVAL_BORDER_WIDTH } from './constants';

interface IntervalBordersProps {
  intervalStartX: number;
  intervalEndX: number;
  trackArea: Rect;
  isDisabled?: boolean;
}

export const IntervalBorders = ({
  intervalStartX,
  intervalEndX,
  trackArea,
  isDisabled = false
}: IntervalBordersProps) => {
  return (
    <>
      <div
        className={cn('absolute', {
          'bg-c7': !isDisabled,
          'bg-c1': isDisabled
        })}
        style={{
          top: 0,
          left: intervalStartX,
          width: intervalEndX - intervalStartX,
          height: INTERVAL_BORDER_WIDTH
        }}
      />
      <div
        className={cn('absolute', {
          'bg-c7': !isDisabled,
          'bg-c1': isDisabled
        })}
        style={{
          top: trackArea.y + trackArea.height,
          left: intervalStartX,
          width: intervalEndX - intervalStartX,
          height: INTERVAL_BORDER_WIDTH
        }}
      />
    </>
  );
};
