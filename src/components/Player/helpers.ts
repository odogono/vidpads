import { safeParseInt } from '@helpers/number';

export interface DataSetPlayerData {
  id: string;
  isPlaying: boolean;
  url: string;
  chokeGroup?: number;
  playPriority?: number;
  startedAt?: number;
  stoppedAt?: number | undefined;
  isOneShot?: boolean;
  isLoop?: boolean;
  isResume?: boolean;
  isVisible?: boolean;
  zIndex?: number;
  opacity?: number;
  pointerEvents?: string;
}

export const hidePlayer = (padId: string) => {
  const playerElement = document.querySelector(
    `[data-player-id="${padId}"]`
  ) as HTMLElement | null;
  if (!playerElement) return;
  playerElement.style.transition = 'none'; // Disable transition
  playerElement.style.opacity = '0';
  playerElement.style.zIndex = '0'; // Send to back when stopped
  playerElement.style.pointerEvents = 'none'; // Prevent pointer events

  return playerElement;
};

export const showPlayer = (padId: string, zIndex: number = 1) => {
  const playerElement = document.querySelector(
    `[data-player-id="${padId}"]`
  ) as HTMLElement | null;
  if (!playerElement) return;
  playerElement.style.transition = 'none';
  playerElement.style.opacity = '1';
  playerElement.style.zIndex = `${zIndex}`;
  playerElement.style.pointerEvents = 'auto'; // Re-enable pointer events

  return playerElement;
};

export const setPlayerData = (
  padId: string,
  data: Partial<DataSetPlayerData>
) => {
  const playerElement = document.querySelector(
    `[data-player-id="${padId}"]`
  ) as HTMLElement | null;
  if (!playerElement) return;

  playerElement.dataset.state = data.isPlaying ? 'playing' : 'stopped';
  playerElement.dataset.url = data.url;
  playerElement.dataset.chokeGroup = data.chokeGroup
    ? data.chokeGroup.toString()
    : undefined;
  playerElement.dataset.playPriority = data.playPriority?.toString();
  playerElement.dataset.startedAt = data.startedAt?.toString();
  playerElement.dataset.stoppedAt = data.stoppedAt
    ? data.stoppedAt.toString()
    : undefined;
  playerElement.dataset.isOneShot = data.isOneShot ? 'true' : 'false';
  playerElement.dataset.isLoop = data.isLoop ? 'true' : 'false';
  playerElement.dataset.isResume = data.isResume ? 'true' : 'false';

  return playerElement;
};

export const setPlayerDataStatePlaying = (
  padId: string,
  isPlaying: boolean
) => {
  const playerElement = document.querySelector(
    `[data-player-id="${padId}"]`
  ) as HTMLElement | null;

  if (!playerElement) {
    return;
  }

  const state = playerElement.dataset.state;
  if (state === 'playing' && !isPlaying) {
    playerElement.dataset.stoppedAt = performance.now().toString();
  }
  playerElement.dataset.state = isPlaying ? 'playing' : 'stopped';

  return playerElement;
};

export const getAllPlayerDataState = (): DataSetPlayerData[] => {
  const elements = document.querySelectorAll(
    '[data-player-id]'
  ) as NodeListOf<HTMLElement>;
  return Array.from(elements).map((element) => ({
    id: element.dataset.playerId!,
    url: element.dataset.url!,
    isPlaying: element.dataset.state === 'playing',
    chokeGroup: element.dataset.chokeGroup
      ? safeParseInt(element.dataset.chokeGroup, 0)
      : undefined,
    playPriority: element.dataset.playPriority
      ? safeParseInt(element.dataset.playPriority, 0)
      : undefined,
    startedAt: element.dataset.startedAt
      ? safeParseInt(element.dataset.startedAt, 0)
      : undefined,
    stoppedAt: safeParseInt(element.dataset.stoppedAt, 0),
    isVisible: parseFloat(element.style.opacity) > 0,
    zIndex: parseInt(element.style.zIndex),
    opacity: parseFloat(element.style.opacity),
    pointerEvents: element.style.pointerEvents,
    isOneShot: element.dataset.isOneShot === 'true',
    isLoop: element.dataset.isLoop === 'true',
    isResume: element.dataset.isResume === 'true'
  }));
};
