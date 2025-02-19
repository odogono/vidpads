import { useEffect, useState } from 'react';

import { Position } from '@types';

export const useEventTooltip = () => {
  const [tooltipPosition, setTooltipPosition] = useState<Position>({
    x: 0,
    y: 0
  });
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  useEffect(() => {
    setIsTooltipVisible(false);
    return () => {
      setIsTooltipVisible(false);
    };
  }, [setIsTooltipVisible]);

  return {
    tooltipPosition,
    isTooltipVisible,
    setTooltipPosition,
    setIsTooltipVisible
  };
};
