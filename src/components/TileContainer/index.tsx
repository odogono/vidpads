import React, { Suspense } from 'react';

import { useFFmpeg } from '@helpers/ffmpeg/useFFmpeg';
import { usePads } from '@model/store/selectors';
import { PadComponent } from '../PadComponent';
import { PadLoadingComponent } from '../PadComponent/Loading';
import { usePadEvents } from './usePadEvents';

export const TileContainer = () => {
  const { ffmpeg } = useFFmpeg();
  const { pads, store } = usePads();
  const {
    dragOverIndex,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleClick,
    handleFileSelect,
    handlePadDragStart,
    handlePadDragEnd,
    ACCEPTED_FILE_TYPES
  } = usePadEvents({ ffmpeg, store });

  return (
    <div className='mt-4 w-[800px] mx-auto'>
      <input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept={ACCEPTED_FILE_TYPES.join(',')}
        onChange={handleFileSelect}
      />
      <div className='grid grid-cols-4 gap-8'>
        {pads.map((pad) => (
          <Suspense key={pad.id} fallback={<PadLoadingComponent />}>
            <PadComponent
              pad={pad}
              isDraggedOver={dragOverIndex === pad.id}
              onTap={handleClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onPadDragStart={handlePadDragStart}
              onPadDragEnd={handlePadDragEnd}
            />
          </Suspense>
        ))}
      </div>
    </div>
  );
};
