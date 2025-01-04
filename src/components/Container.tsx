export const Container: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='max-w-6xl mx-auto p-8'>{children}</div>
    </div>
  );
};
