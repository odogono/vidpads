'use client';

import { createContext } from 'react';

import type { FFmpegContextType } from '@helpers/ffmpeg/types';

export const FFmpegContext = createContext<FFmpegContextType | null>(null);
