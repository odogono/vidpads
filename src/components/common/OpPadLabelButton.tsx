import { useCallback, useMemo, useRef, useState } from 'react';

import { Tag } from 'lucide-react';

import { runAfter } from '@helpers/time';
import { Input, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { useKeyboard } from '@hooks/useKeyboard';
import { OpButton } from './OpButton';

interface OpPadLabelButtonProps {
  isEnabled: boolean;
  onChange?: (label: string) => void;
  value?: string;
}

export const OpPadLabelButton = ({
  isEnabled,
  onChange,
  value: initialValue
}: OpPadLabelButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(initialValue ?? '');
  const { setIsEnabled } = useKeyboard();
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const clearAllFocus = useCallback(() => {
    // Small delay to ensure focus is cleared after state updates
    runAfter(200, () => {
      if (document.activeElement !== document.body) {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    }); // Increased timeout to ensure state updates complete
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setIsOpen(isOpen);
      setValue(initialValue ?? '');

      // When closing
      if (!isOpen) {
        // First update the value
        onChange?.(value);
        // Then clear focus and re-enable keyboard
        requestAnimationFrame(() => {
          clearAllFocus();
          setIsEnabled(true);
        });
      } else {
        setIsEnabled(false);
      }
    },
    [initialValue, onChange, value, setIsEnabled, clearAllFocus]
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setValue(value);
    },
    [setValue]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleOpenChange(false);
      }
    },
    [handleOpenChange]
  );

  const trigger = useMemo(() => {
    return (
      <OpButton ref={buttonRef} label='Label' isEnabled={isEnabled}>
        <Tag />
      </OpButton>
    );
  }, [isEnabled]);

  if (!isEnabled) {
    return trigger;
  }

  return (
    <Popover
      placement='bottom'
      showArrow
      offset={10}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent className='bg-background'>
        <div className='px-1 py-2 w-full'>
          <div className='mt-2 flex flex-col gap-2 w-full'>
            <Input
              ref={inputRef}
              autoFocus
              value={value}
              isClearable
              color='primary'
              variant='bordered'
              label='Pad Label'
              size='sm'
              maxLength={60}
              isDisabled={!isEnabled}
              onValueChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onClear={() => onChange?.('')}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
