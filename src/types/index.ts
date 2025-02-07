export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export type ControlPanes = 'state' | 'interval' | 'sequencer' | 'details';

export type GeneralTouchEvent =
  | React.TouchEvent<HTMLElement>
  | React.MouseEvent<HTMLElement>
  | React.PointerEvent<Element>
  | MouseEvent
  | TouchEvent;
