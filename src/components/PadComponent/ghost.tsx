import { useCallback, useMemo, useRef } from 'react';

// this variable indicates whether this browser is safari
const isSafari =
  /Safari/.test(navigator.userAgent) &&
  navigator.userAgent.indexOf('Chrome') < 0;

export const useGhostDrag = () => {
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const createGhost = useCallback(
    (e: TouchEvent | MouseEvent, ref: HTMLDivElement) => {
      const dragGhost = createDragGhost(e, ref);
      ghostRef.current = dragGhost;
      return dragGhost;
    },
    []
  );

  const removeGhost = useCallback(() => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
  }, []);

  const updateGhost = useCallback((x: number, y: number) => {
    if (!ghostRef.current) return;
    const ghost = ghostRef.current;

    // Get the stored offsets
    const offsetX = parseFloat(ghost.dataset.offsetX || '0');
    const offsetY = parseFloat(ghost.dataset.offsetY || '0');

    // Calculate new position maintaining the same relative touch position
    const newX = x - offsetX;
    const newY = y - offsetY;

    ghost.style.transform = `translate3d(${newX}px, ${newY}px, 0) scale(0.9)`;
  }, []);

  return { ghostRef, createGhost, removeGhost, updateGhost };
};

export const createDragGhost = (
  e: TouchEvent | MouseEvent,
  ref: HTMLDivElement
) => {
  const rect = ref.getBoundingClientRect();
  const dragGhost = document.createElement('div');

  // Get cursor/touch position
  const isMouseEvent = e.type.includes('mouse') || e.type.includes('drag');
  const clientX = isMouseEvent
    ? (e as MouseEvent).clientX
    : (e as TouchEvent).touches[0].clientX;
  const clientY = isMouseEvent
    ? (e as MouseEvent).clientY
    : (e as TouchEvent).touches[0].clientY;

  // Calculate offset from the click/touch point to the element's top-left corner
  const offsetX = clientX - rect.left;
  const offsetY = clientY - rect.top;

  // Store the offset on the ghost element for use in updateGhostPosition
  dragGhost.dataset.offsetX = offsetX.toString();
  dragGhost.dataset.offsetY = offsetY.toString();

  // Calculate initial position maintaining the same relative touch position
  const initialX = clientX - offsetX;
  const initialY = clientY - offsetY;

  const computedStyle = window.getComputedStyle(ref);

  // Create a lightweight version that looks similar
  Object.assign(dragGhost.style, {
    position: 'fixed',
    pointerEvents: 'none',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: '1000',
    margin: '0',
    left: '0',
    top: '0',
    willChange: 'transform',
    opacity: '1',
    transform: `translate3d(${initialX}px, ${initialY}px, 0) scale(0.9)`,
    background: computedStyle.background,
    borderRadius: computedStyle.borderRadius
  });

  // If there's a thumbnail, create a simplified version
  const thumbnail = ref.querySelector('img');
  if (thumbnail) {
    const img = document.createElement('img');
    img.src = (thumbnail as HTMLImageElement).src;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = computedStyle.borderRadius;
    dragGhost.appendChild(img);
  }

  if (!isSafari) {
    document.body.appendChild(dragGhost);
  }

  return dragGhost;
};
