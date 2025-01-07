export type GeneralTouchEvent =
  | React.TouchEvent<HTMLDivElement>
  | React.MouseEvent<HTMLDivElement>
  | MouseEvent
  | TouchEvent;
