import { LoadingSpinner } from '@components/LoadingSpinner';

interface LoadingPlayerProps {
  count: number;
  loadingCount: number;
}

export const LoadingPlayer = ({ count, loadingCount }: LoadingPlayerProps) => {
  const isReady = loadingCount >= count;
  return (
    <div className='vo-player-loading-container w-full h-full flex items-center justify-center gap-4'>
      {!isReady && (
        <>
          <LoadingSpinner />
        </>
      )}
      {!isReady && `Loading... ${loadingCount} / ${count}`}
      {isReady && 'Ready'}
    </div>
  );
};
