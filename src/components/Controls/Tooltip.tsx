import { formatTimeToString } from '@helpers/time';

export interface TooltipProps {
  time: number;
  x: number;
}

export const Tooltip = ({ time, x }: TooltipProps) => {
  if (x === -1) return null;
  const timeString = formatTimeToString(time);

  const bgColor = 'bg-yellow-500';
  const borderColor = 'border-t-yellow-500';

  return (
    <div
      className={`absolute z-10 w-[6vh] h-[2vh] ${bgColor} text-black text-center flex items-center justify-center`}
      style={{
        top: 40,
        left: x,
        transform: 'translateX(-35%)',
        borderRadius: 10
      }}
    >
      {timeString}
      {/* Arrow/caret - made larger and more visible */}
      <div
        className={`absolute left-1/2 top-full -translate-x-1/2 -mt-0 
                          border-solid border-t-8 border-x-8 border-b-0
                          ${borderColor} border-x-transparent`}
        aria-hidden='true'
      />
    </div>
  );
};
