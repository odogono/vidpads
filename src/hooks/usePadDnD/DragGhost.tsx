import { useEffect, useState } from 'react';

interface DragGhostProps {
  id: string;
  position: { x: number; y: number };
  element: HTMLElement | null;
}

export const DragGhost = ({ id, position, element }: DragGhostProps) => {
  const [thumbnail, setThumbnail] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = element?.querySelector('img');
    if (img) {
      setThumbnail(img as HTMLImageElement);
    }
  }, [element]);

  return (
    <div
      className='vo-drag-ghost fixed pointer-events-none z-[9999] rounded-md'
      style={{
        transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: '2px solid #3b82f6',
        color: 'white',
        width: '100px',
        height: '100px'
      }}
    >
      {thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className='w-full h-full object-cover rounded-md opacity-70'
          src={thumbnail.src}
          alt={`Dragging thumbnail for pad ${id}`}
        />
      )}
      <div className='absolute left-0 top-0 w-full h-full bg-black/50 rounded-md'>
        <div className='w-full h-full flex items-end justify-end p-2 text-xs'>
          {id}
        </div>
      </div>
    </div>
  );
};
