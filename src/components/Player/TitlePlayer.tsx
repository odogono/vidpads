/* eslint-disable @next/next/no-img-element */
'use client';

import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

import { CircleX } from 'lucide-react';

import { LoadingSpinner } from '@components/LoadingSpinner';
import { createLog } from '@helpers/log';
import { useKeyboard } from '@hooks/useKeyboard';
import { useCurrentProject } from '@model/hooks/useCurrentProject';

const log = createLog('TitlePlayer', ['debug']);

interface TitlePlayerProps {
  count: number;
  loadingCount: number;
}

export const TitlePlayer = ({ count, loadingCount }: TitlePlayerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { projectName, setProjectName, projectBgImage } = useCurrentProject();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(projectName);
  const { setIsEnabled } = useKeyboard();

  useEffect(() => {
    setEditedName(projectName);
  }, [projectName]);

  const handleClick = useCallback(() => {
    setIsEnabled(false);
    setIsEditing(true);
    setEditedName(projectName);
    inputRef.current?.blur();
    log.debug('[handleClick] projectName', projectName);
  }, [projectName, setIsEnabled, setEditedName]);

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (editedName.trim()) {
          setIsEditing(false);
          setIsEnabled(true);
          setProjectName(editedName.trim());
        }
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        setIsEnabled(true);
        setEditedName(projectName);
      }
    },
    [editedName, projectName, setProjectName, setIsEnabled]
  );

  const handleBlur = useCallback(() => {
    if (editedName.trim()) {
      setIsEditing(false);
      setIsEnabled(true);
      setProjectName(editedName.trim());
    } else {
      setEditedName(projectName);
      setIsEditing(false);
      setIsEnabled(true);
    }
  }, [editedName, projectName, setProjectName, setIsEnabled]);

  const handleClearClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    setEditedName('');
    inputRef.current?.focus();
  }, []);

  const isReady = loadingCount >= count;

  return (
    <div
      data-player-id='title'
      className={`vo-player vo-player-title-container 
        absolute top-0 left-0 
        w-full h-full 
        flex flex-col 
        bg-video-off 
        items-center 
        justify-center 
        gap-4`}
    >
      <div className='vo-player-bg-image absolute top-0 left-0 w-full h-full z-[-3] overflow-hidden'>
        <img
          src={projectBgImage || undefined}
          className='w-full h-full object-cover'
          alt={''}
        />
      </div>
      <div className='vo-player-crt absolute top-0 left-0 w-full h-full z-[-2] crt-without-animation' />

      <div className='vo-player-title-text bg-black/40 rounded-lg p-2 h-[3rem] px-4 min-w-[16rem] max-w-[40rem]'>
        {isEditing ? (
          <div className='relative'>
            <input
              ref={inputRef}
              className='w-[30vw] text-lg font-bold text-foreground bg-transparent border-b border-foreground/20 focus:border-foreground outline-none px-2 text-center pr-8 truncate'
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              autoFocus
            />
            {editedName && (
              <button
                className='absolute right-2 top-1/2 pb-2 -translate-y-1/2 text-foreground/60 hover:text-foreground'
                onMouseDown={(e) => {
                  // Use onMouseDown instead of onClick to prevent blur
                  e.preventDefault();
                  handleClearClick(e);
                }}
              >
                <CircleX />
              </button>
            )}
          </div>
        ) : (
          <div
            className='text-xl font-bold text-foreground hover:cursor-pointer hover:opacity-80 truncate whitespace-nowrap text-center'
            onClick={handleClick}
          >
            {editedName}
          </div>
        )}
      </div>
      <div className='vo-player-title-status w-[16rem] h-[3rem] flex items-center justify-center bg-black/40 rounded-lg p-2'>
        <div className='flex flex-row gap-2 items-center '>
          <span>{!isReady && <LoadingSpinner />}</span>
          <span>
            {!isReady && `Loading... ${loadingCount} / ${count}`}
            {isReady && 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};
