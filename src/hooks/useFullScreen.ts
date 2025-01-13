'use client';

import { useState } from 'react';

export const useFullScreen = () => {
  const [isFullscreen, setFullscreen] = useState(false);

  return { isFullscreen, setFullscreen };
};
