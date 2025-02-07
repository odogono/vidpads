import { GeneralTouchEvent, Position } from '@types';

// Add this helper function to get computed CSS values
export const getComputedColor = (varName: string) => {
  // Remove var() wrapper if it exists
  const cleanVarName = varName.replace(/^var\((.*)\)$/, '$1').trim();

  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue(cleanVarName).trim();
};

export const isTouchEvent = (e: GeneralTouchEvent) => e.type.includes('touch');
export const isMouseEvent = (e: GeneralTouchEvent) => e.type.includes('mouse');
export const isPointerEvent = (e: GeneralTouchEvent) =>
  e.type.includes('pointer');

export const isDragEvent = (e: GeneralTouchEvent) =>
  (e as DragEvent).dataTransfer !== undefined;

export type GeneralDragEvent = React.DragEvent<Element> | DragEvent;

export const getClientPosition = (e: GeneralTouchEvent): Position => {
  return isMouseEvent(e) || isDragEvent(e) || isPointerEvent(e)
    ? {
        x: (e as React.MouseEvent).clientX,
        y: (e as React.MouseEvent).clientY
      }
    : {
        x: (e as React.TouchEvent).touches[0].clientX,
        y: (e as React.TouchEvent).touches[0].clientY
      };
};

export const getOffsetPosition = (e: GeneralTouchEvent | GeneralDragEvent) => {
  if (
    isMouseEvent(e as GeneralTouchEvent) ||
    isDragEvent(e as GeneralTouchEvent) ||
    isPointerEvent(e as GeneralTouchEvent)
  ) {
    return {
      x: (e as React.MouseEvent<HTMLDivElement>).nativeEvent.offsetX,
      y: (e as React.MouseEvent<HTMLDivElement>).nativeEvent.offsetY
    };
  }
  const et = e as React.TouchEvent<HTMLElement>;

  const rect = (et.touches[0].target as HTMLElement).getBoundingClientRect();

  return {
    x: et.touches[0].pageX - rect.left,
    y: et.touches[0].pageY - rect.top
  };
};
