import { ReactNode, useState } from 'react';

import { PadDnDContext } from './context';

export const PadDnDProvider = ({ children }: { children: ReactNode }) => {
  const [draggingPadId, setDraggingPadId] = useState<string | null>(null);

  return (
    <PadDnDContext.Provider
      value={{
        isDragging: draggingPadId !== null,
        draggingPadId,
        setDraggingPadId
      }}
    >
      {children}
    </PadDnDContext.Provider>
  );
};
