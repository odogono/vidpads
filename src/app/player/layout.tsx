const PlayerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='min-h-screen w-screen bg-sky-200 flex justify-center items-center overflow-hidden'>
      <div className='w-screen h-screen flex justify-center items-center p-5 box-border'>
        <div
          className={`
            bg-white 
            border-2 
            border-gray-700 
            rounded-2xl 
            shadow-md 
            relative
            portrait:w-[min(calc(100vw-40px),calc((100vh-40px)*0.707))]
            portrait:aspect-[724/1024]
            landscape:h-[min(calc(100vh-40px),calc((100vw-40px)*0.707))]
            landscape:aspect-[1024/724]
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default PlayerLayout;
