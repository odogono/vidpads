import { useCallback, useMemo, useState } from 'react';

import { Tag } from 'lucide-react';

import { Input, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
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

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setIsOpen(isOpen);
      setValue(initialValue ?? '');
      if (!isOpen) {
        onChange?.(value);
      }
    },
    [initialValue, onChange, value]
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
        e.currentTarget.blur();
        handleOpenChange(false);
      }
    },
    [handleOpenChange]
  );

  const trigger = useMemo(() => {
    return (
      <OpButton label='Label' isEnabled={isEnabled}>
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
              autoFocus
              value={value}
              isClearable
              color='primary'
              variant='bordered'
              label='Pad Label'
              size='sm'
              maxLength={30}
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
