import { LoadingSpinner } from '../LoadingSpinner';

export const PadLoadingComponent = () => {
  return (
    <div
      className={`
        w-full min-h-[44px] h-full rounded-lg cursor-pointer bg-pad transition-all relative select-none touch-none
      `}
    >
      <div className='absolute inset-0 flex items-center justify-center'>
        <LoadingSpinner />
      </div>
    </div>
  );
};
