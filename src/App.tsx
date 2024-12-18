import { useState, useRef } from 'react';
import { createLogger } from '@helpers/log';
import { useFFmpeg } from './helpers/ffmpeg';

const log = createLogger('App');

function App() {
  // const [loaded, setLoaded] = useState(false);
  // const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // const ffmpegRef = useRef<FFmpeg>(new FFmpeg());
  // const messageRef = useRef<HTMLParagraphElement | null>(null);
  // const [isProcessing, setIsProcessing] = useState(false);

  const { processVideo, isProcessing, videoUrl } = useFFmpeg({
    loadOnMount: true,
  });

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith('video/')) {
      await processVideo(file);
      // setVideoUrl(processedUrl);
    }
    //   await ffmpegRef.current.writeFile('input.mp4', await fetchFile(file));

    //   await ffmpegRef.current.exec([
    //     '-i',
    //     'input.mp4',
    //     '-t',
    //     '5',
    //     '-c',
    //     'copy',
    //     'output.mp4',
    //   ]);

    //   const data = await ffmpegRef.current.readFile('output.mp4');
    //   const processedUrl = URL.createObjectURL(
    //     new Blob([data], { type: 'video/mp4' })
    //   );

    //   setVideoUrl(processedUrl);
    // } catch (error) {
    //   console.error('Error processing video:', error);
    //   alert('Error processing video');
    // } finally {
    //   setIsProcessing(false);
    // }
    // }
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
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Vid-Wiz</h1>

      {!videoUrl ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-600 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}>
          {isProcessing ? (
            <div className="text-gray-600">Processing video...</div>
          ) : (
            'Drop your video file here'
          )}
        </div>
      ) : (
        <div className="mt-8">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full max-w-3xl mx-auto block"
            controls={false}
          />
          <div className="flex gap-4 justify-center mt-4">
            <button
              onClick={togglePlay}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
