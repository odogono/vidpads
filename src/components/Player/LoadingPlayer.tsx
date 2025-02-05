interface LoadingPlayerProps {
  count: number;
  loadingCount: number;
}

export const LoadingPlayer = ({ count, loadingCount }: LoadingPlayerProps) => {
  const isReady = loadingCount >= count;
  return (
    <div className='vo-player-loading-container w-full h-full flex items-center justify-center'>
      {!isReady && (
        <div className='w-8 h-8 border-4 border-gray-600 mr-4 border-t-gray-400 rounded-full animate-spin' />
      )}
      {!isReady && `Loading... ${loadingCount} / ${count}`}
      {isReady && 'Ready'}
    </div>
  );
};
