import { useEffect, useState } from 'react';

import type { Pad } from '@model/types';
import { getThumbnailFromUrl, useThumbnail } from '../model/db/api';
import { getPadSourceUrl } from '../model/pad';

export interface PadComponentProps {
  pad: Pad;
  isDraggedOver: boolean;
  onTap: (padId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, padId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, padId: string) => void;
}

export const PadComponent = ({
  pad,
  isDraggedOver,
  onTap,
  onDragOver,
  onDragLeave,
  onDrop
}: PadComponentProps) => {
  const { data: thumbnail } = useThumbnail(getPadSourceUrl(pad));

  return (
    <div
      key={pad.id}
      className={`
              aspect-square rounded-lg cursor-pointer transition-all relative
              ${
                isDraggedOver
                  ? 'bg-gray-600 scale-105'
                  : 'bg-gray-800 hover:bg-gray-700'
              }
            `}
      onClick={() => onTap(pad.id)}
      onDragOver={(e) => onDragOver(e, pad.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, pad.id)}
    >
      {thumbnail && (
        <img
          src={thumbnail}
          alt={`Thumbnail for pad ${pad.id}`}
          className='w-full h-full object-cover rounded-lg'
        />
      )}
      <span className='absolute bottom-2 right-2 text-xs text-gray-400 select-none'>
        {pad.id}
      </span>
    </div>
  );
};
