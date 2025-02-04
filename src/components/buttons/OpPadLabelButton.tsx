import { useCallback, useState } from 'react';

import { Tag } from 'lucide-react';

import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@nextui-org/react';
import { OpButton } from './OpButton';

interface OpPadLabelButtonProps {
  isEnabled: boolean;
  onChange?: (label: string) => void;
}

export const OpPadLabelButton = ({
  isEnabled,
  onChange
}: OpPadLabelButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      console.debug('handleOpenChange', { isOpen, value });
      setIsOpen(isOpen);
      if (!isOpen) {
        onChange?.(value);
      }
    },
    [onChange, value]
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

  return (
    <Popover
      placement='bottom'
      showArrow
      offset={10}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger>
        <OpButton label='Label' isEnabled={isEnabled}>
          <Tag />
        </OpButton>
      </PopoverTrigger>
      <PopoverContent className='bg-slate-600'>
        <div className='px-1 py-2 w-full'>
          <div className='mt-2 flex flex-col gap-2 w-full'>
            <Input
              autoFocus
              isClearable
              label='Pad Label'
              size='sm'
              maxLength={25}
              isDisabled={!isEnabled}
              className='bg-slate-600'
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
