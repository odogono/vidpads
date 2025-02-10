import { KeyboardEvent, useCallback, useState } from 'react';

import { LoadingSpinner } from '@components/LoadingSpinner';
import { useKeyboard } from '@helpers/keyboard/useKeyboard';
import { useProjectName } from '@model/store/selectors';

interface LoadingPlayerProps {
  count: number;
  loadingCount: number;
}

export const LoadingPlayer = ({ count, loadingCount }: LoadingPlayerProps) => {
  const { projectName, setProjectName } = useProjectName();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(projectName ?? 'Untitled');
  const { setIsEnabled } = useKeyboard();

  const handleClick = useCallback(() => {
    setIsEnabled(false);
    setIsEditing(true);
    setEditedName(projectName);
  }, [projectName, setIsEnabled]);

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

  const isReady = loadingCount >= count;
  return (
    <div
      data-player-id='title'
      className={`vo-player vo-player-loading-container 
        absolute top-0 left-0 
        w-full h-full 
        flex flex-col 
        bg-video-off 
        items-center 
        justify-center 
        gap-4`}
    >
      {isEditing ? (
        <input
          className='text-lg font-bold text-foreground bg-transparent border-b border-foreground/20 focus:border-foreground outline-none px-2 text-center'
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setIsEditing(false);
            setEditedName(projectName);
          }}
          autoFocus
        />
      ) : (
        <div
          className='text-lg font-bold text-foreground hover:cursor-pointer hover:opacity-80'
          onClick={handleClick}
        >
          {editedName}
        </div>
      )}
      <div className='flex flex-row gap-2 items-center'>
        {!isReady && (
          <>
            <LoadingSpinner />
          </>
        )}
        {!isReady && `Loading... ${loadingCount} / ${count}`}
        {isReady && 'Ready'}
      </div>
    </div>
  );
};
