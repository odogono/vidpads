interface LoadingPlayerProps {
  count: number;
  loadingCount: number;
}

export const LoadingPlayer = ({ count, loadingCount }: LoadingPlayerProps) => {
  const isReady = loadingCount >= count;
  return (
    <div className='vo-player-loading-container w-full h-full flex items-center justify-center'>
      {!isReady && (
        <div className='w-10 h-10 bg-gray-200 rounded-full animate-pulse'></div>
      )}
      {!isReady && `Loading... ${loadingCount} / ${count}`}
      {isReady && 'Ready'}
    </div>
  );
};
