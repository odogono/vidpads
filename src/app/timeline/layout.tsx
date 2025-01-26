const TimelineLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='App grid w-screen h-screen place-items-center'>
      <div className='Container w-[60vw] h-[40vh]'>{children}</div>
    </div>
  );
};

export default TimelineLayout;
