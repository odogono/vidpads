export const hidePlayer = (padId: string) => {
  const playerElement = document.querySelector(
    `[data-player-id="${padId}"]`
  ) as HTMLElement | null;
  if (playerElement) {
    playerElement.style.transition = 'none'; // Disable transition
    playerElement.style.opacity = '0';
    playerElement.style.zIndex = '0'; // Send to back when stopped
    playerElement.style.pointerEvents = 'none'; // Prevent pointer events
    playerElement.dataset.state = 'stopped';
  }
  return playerElement;
};

export const showPlayer = (padId: string, zIndex: number = 1) => {
  const playerElement = document.querySelector(
    `[data-player-id="${padId}"]`
  ) as HTMLElement | null;
  if (playerElement) {
    playerElement.style.transition = 'none';
    playerElement.style.opacity = '1';
    playerElement.style.zIndex = `${zIndex}`;
    playerElement.style.pointerEvents = 'auto'; // Re-enable pointer events
    playerElement.dataset.state = 'playing';
  }
  return playerElement;
};

export const getPlayerElements = () => {
  const elements = document.querySelectorAll(
    '[data-player-id]'
  ) as NodeListOf<HTMLElement>;
  return Array.from(elements).map((element) => ({
    id: element.dataset.playerId,
    zIndex: parseInt(element.style.zIndex),
    opacity: parseFloat(element.style.opacity),
    state: element.dataset.state,
    pointerEvents: element.style.pointerEvents
  }));
};

export const getPlayerElement = (padId: string) => {
  return document.querySelector(
    `[data-player-id="${padId}"]`
  ) as HTMLElement | null;
};

export const hideElement = (element: HTMLElement) => {
  element.style.transition = 'none'; // Disable transition
  element.style.opacity = '0';
  element.style.zIndex = '0'; // Send to back when stopped
};

export const showElement = (element: HTMLElement) => {
  element.style.transition = 'none'; // Disable transition
  element.style.opacity = '1';
  element.style.zIndex = '100';
};

export const setZIndex = (element: HTMLElement, index: number) => {
  element.style.zIndex = `${index}`;
};

export const setPlayerZIndex = (padId: string, index: number) => {
  const playerElement = document.querySelector(
    `[data-player-id="${padId}"]`
  ) as HTMLElement | null;
  if (playerElement) {
    playerElement.style.zIndex = `${index}`;
    playerElement.dataset.state = 'playing';
  }
  return playerElement;
};

export const setPlayerDataState = (
  padId: string,
  value: 'playing' | 'stopped'
) => {
  const playerElement = document.querySelector(
    `[data-player-id="${padId}"]`
  ) as HTMLElement | null;
  if (playerElement) {
    playerElement.dataset.state = value;
  }
};

export const getPlayerDataState = (padId: string) => {
  const playerElement = document.querySelector(
    `[data-player-id="${padId}"]`
  ) as HTMLElement | null;
  return playerElement?.dataset.state as 'playing' | 'stopped' | undefined;
};
