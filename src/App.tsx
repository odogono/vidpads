import { useRef, useState } from 'react';

import { createLogger } from '@helpers/log';
import { useFFmpeg } from './helpers/ffmpeg';

const log = createLogger('App');

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  type: string;
  size: number;
}

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);

  const { processVideo, isProcessing, videoUrl } = useFFmpeg({
    loadOnMount: true
  });

  const getVideoMetadata = (file: File): Promise<VideoMetadata> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src); // Clean up
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          type: file.type,
          size: file.size
        });
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith('video/')) {
      try {
        const videoMetadata = await getVideoMetadata(file);
        setMetadata(videoMetadata);
        log.info('Video metadata:', videoMetadata);
        await processVideo(file);
      } catch (error) {
        log.error('Error reading video metadata:', error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = 'processed-video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='max-w-6xl mx-auto p-8'>
        <h1 className='text-3xl font-bold mb-8'>Vid-Wiz</h1>

        <div
          className={`w-[800px] h-[400px] mx-auto ${
            !videoUrl
              ? 'border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400'
              : ''
          } transition-colors`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {!videoUrl ? (
            isProcessing ? (
              <div className='text-gray-400'>Processing video...</div>
            ) : (
              'Drop your video file here'
            )
          ) : (
            <div className='h-full'>
              <div
                className='relative h-full'
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className='w-[800px] h-[400px] object-contain'
                  controls={false}
                />
                {isProcessing && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                    <div className='text-gray-200'>Processing new video...</div>
                  </div>
                )}
              </div>
              <div className='flex gap-4 justify-center mt-4'>
                <button
                  onClick={togglePlay}
                  className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={handleDownload}
                  className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        {metadata && (
          <div className='mt-4 p-4 bg-gray-800 rounded-lg w-[800px] mx-auto'>
            <h2 className='text-xl font-semibold mb-2'>Video Information</h2>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>Duration: {metadata.duration.toFixed(2)}s</div>
              <div>
                Resolution: {metadata.width}x{metadata.height}
              </div>
              <div>Format: {metadata.type}</div>
              <div>Size: {(metadata.size / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
