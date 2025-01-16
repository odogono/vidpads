export const hidePlayer = (padId: string) => {
  const playerElement = document.querySelector(
    `[data-player-id="${padId}"]`
  ) as HTMLElement | null;
  if (playerElement) {
    playerElement.style.transition = 'none'; // Disable transition
    playerElement.style.opacity = '0';
    playerElement.style.zIndex = '0'; // Send to back when stopped
    playerElement.dataset.state = 'stopped';
  }
  return playerElement;
};

export const showPlayer = (padId: string) => {
  const playerElement = document.querySelector(
    `[data-player-id="${padId}"]`
  ) as HTMLElement | null;
  if (playerElement) {
    playerElement.style.transition = 'none'; // Disable transition
    playerElement.style.opacity = '1';
    playerElement.style.zIndex = '1000'; // Bring to front
    playerElement.dataset.state = 'playing';
  }
  return playerElement;
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
  element.style.zIndex = '1000'; // Bring to front
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
