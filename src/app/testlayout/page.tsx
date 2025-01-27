'use client';

const TestLayout = () => {
  const isFullscreen = false;
  return (
    <div
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
        className={`relative ${
          isFullscreen ? 'fixed inset-0 w-screen h-screen z-50' : 'flex-1'
        }`}
      >
        <div className='relative w-full h-full overflow-hidden'>
          <div className={`absolute top-0 left-0 w-full h-full`} />
        </div>
      </div>
    </div>
  );
};

export default TestLayout;
