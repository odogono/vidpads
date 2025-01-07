export const PadLoadingComponent = () => {
  return (
    <div
      className={`
        aspect-square rounded-lg relative
        bg-gray-800 animate-pulse
      `}
    >
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='w-8 h-8 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin' />
      </div>
    </div>
  );
};
