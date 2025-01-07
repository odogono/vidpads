import { useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { loadVideoData } from '@model/db/api';
import { getMediaIdFromUrl } from '@model/helpers';
import { getPadSourceUrl } from '@model/pad';
import { PlayPadEvent } from '@model/store/types';
import { useStore } from '@model/store/useStore';
import { LocalPlayer } from './LocalPlayer';
import { PlayerProps } from './types';

const log = createLog('player/container');

type PlayerMap = { [key: string]: PlayerProps };

export const PlayerContainer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const store = useStore();
  const blobUrlRef = useRef<string | null>(null);

  const [players, setPlayers] = useState<PlayerMap>({});

  // const players = useRef<{ [key: string]: PlayerDetails }>({});

  useEffect(() => {
    const sub = store.on('playPad', async (event: PlayPadEvent) => {
      log.debug('playPad', event);
      const { pad } = event;

      const url = getPadSourceUrl(pad);
      if (!url) return;

      const id = getMediaIdFromUrl(url);
      if (!id) return;

      // set all the players to invisible
      const newPlayers = Object.values(players).reduce((acc, player) => {
        acc[player.url] = { ...player, isVisible: false };
        return acc;
      }, {} as PlayerMap);

      // set the new player to visible
      newPlayers[url] = { url, isVisible: true, currentTime: 0 };

      log.debug('setting new players', Object.values(newPlayers).length);
      setPlayers(newPlayers);

      // setPlayers((prev) => ({ ...prev, [id]: { url, isVisible: true } }));

      // try {
      //   const { file } = await loadVideoData(id);

      //   // Create a blob URL from the video file
      //   const videoUrl = URL.createObjectURL(file);
      //   blobUrlRef.current = videoUrl;

      //   // Set the video source and play
      //   if (videoRef.current) {
      //     videoRef.current.src = videoUrl;
      //     videoRef.current.play();
      //   }
      // } catch (error) {
      //   log.error('Error loading video:', error);
      // }
    });

    return () => {
      // Clean up blob URL when component unmounts
      // if (blobUrlRef.current) {
      //   URL.revokeObjectURL(blobUrlRef.current);
      //   blobUrlRef.current = null;
      // }
      sub.unsubscribe();
    };
  }, [players, store]);

  log.debug('render', Object.values(players).length);

  return (
    <div className='relative w-[800px] mx-auto'>
      <div className={`w-[800px] h-[400px] transition-colors`}>
        {Object.values(players).map((player) => (
          <LocalPlayer key={player.url} {...player} />
        ))}
      </div>
    </div>
  );
};
