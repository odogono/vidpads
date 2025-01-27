export const PlayHead = () => {
  return (
    <div
      className='absolute vo-seq-playhead w-[20px] h-full '
      style={{
        left: `1px`,
        cursor: 'ew-resize'
      }}
    >
      <div
        className=''
        style={{
          width: 0,
          height: 0,
          borderLeft: `10px solid transparent`,
          borderRight: `10px solid transparent`,
          borderTop: `10px solid #aaa`
        }}
      />
      <div className='w-[1px] h-full ml-[9px] bg-white' />
    </div>
  );
};
