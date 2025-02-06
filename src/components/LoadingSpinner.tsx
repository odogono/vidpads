'use client';

interface LoadingSpinnerProps {
  length?: number;
  cols?: number;
}

export const LoadingSpinner = ({
  length = 16,
  cols = 4
}: LoadingSpinnerProps) => {
  const squareCss = Array.from({ length })
    .map((_, index) => {
      const delay = Math.random() * 10;
      return `.vo-load-cell:nth-child(${index + 1}) { animation-delay: ${delay}s; }`;
    })
    .join('\n');

  // <div className='w-8 h-8 border-4 border-gray-600 mr-4 border-t-gray-400 rounded-full animate-spin' />

  return (
    <>
      <style>
        {`
          @keyframes fade {
            0%, 100% { background: #FFFFFF00; }
            2% { background: white; }
            14% { background: #FFFFFF00; }
          }
          .vo-load-cell {
            animation: fade 4s infinite;
          }
          ${squareCss}
        `}
      </style>
      <div className={`grid grid-cols-${cols} gap-[1px] w-9 h-9`}>
        {Array.from({ length }).map((_, index) => (
          <div
            key={index}
            className='vo-load-cell w-full h-full bg-white/0 rounded-sm border border-white/10'
          />
        ))}
      </div>
    </>
  );
};
