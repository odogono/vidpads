'use client';

const TestLayout = () => {
  const isFullscreen = false;
  return (
    <div
      id='player-main'
      className={`w-full h-full text-white dark text-foreground flex flex-col ${
        isFullscreen ? 'p-0' : 'p-8'
      }`}
    >
      <header
        className={`flex justify-between p-4 w-full mx-auto items-center ${isFullscreen ? 'hidden' : ''}`}
      >
        <div className='text-white text-xl font-bold'>ODGN VO-1</div>
      </header>

      <div
        id='fullscreen-wrapper'
        className={`relative ${
          isFullscreen ? 'fixed inset-0 w-screen h-screen z-50' : 'flex-1'
        }`}
      >
        <div
          id='player-wrapper'
          className='relative w-full h-full overflow-hidden'
        >
          <div
            id='player-container'
            className={`absolute top-0 left-0 w-full h-full`}
          />
        </div>
      </div>
    </div>
  );
};

export default TestLayout;
