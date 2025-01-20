import { useEffect, useImperativeHandle, useState } from 'react';

import { useKeyboard } from '@helpers/keyboard/useKeyboard';
import { createLog } from '@helpers/log';
import { formatTimeStringToSeconds, formatTimeToString } from '@helpers/time';
import { Input } from '@nextui-org/react';

const log = createLog('TimeInput');

export interface TimeInputRef {
  setValue: (value: number) => void;
  getValue: () => number;
}
interface TimeInputProps {
  ref?: React.RefObject<TimeInputRef | null>;
  initialValue: number;
  defaultValue?: number | undefined;
  range?: [number, number];
  description: string;
  isDisabled?: boolean;
  onChange?: (value: number) => void;
  showIncrementButtons?: boolean;
}

export const TimeInput = ({
  ref,
  initialValue,
  defaultValue,
  description,
  isDisabled,
  onChange,
  range
}: TimeInputProps) => {
  const { setIsEnabled: setKeyboardEnabled } = useKeyboard();
  const [inputValue, setInputValue] = useState<string>(
    formatTimeToString(initialValue)
  );

  useEffect(() => {
    // log.debug('TimeInput', description, initialValue);
    setInputValue(formatTimeToString(initialValue));
  }, [initialValue]);

  useImperativeHandle(ref, () => ({
    setValue: (value: number) => {
      // if (description === 'Start') log.debug('ref.setValue', value);
      setInputValue(formatTimeToString(value));
    },
    getValue: () => {
      return formatTimeStringToSeconds(inputValue);
    }
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // log.debug('handleChange', input);
    try {
      const newValue = formatTimeStringToSeconds(input);
      log.debug('handleChange', input, newValue, formatTimeToString(newValue));
      setInputValue(formatTimeToString(newValue));
      onChange?.(newValue);
    } catch {
      log.debug('Invalid time format', input);
      setInputValue(formatTimeToString(defaultValue ?? 0));
      onChange?.(defaultValue ?? 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
      // unfocus the input
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // log.debug('handleInput', e.target.value);
    setInputValue(e.target.value);
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent page scrolling
    if (isDisabled) return;

    const [min, max] = range ? range : [0, 100];

    const currentSeconds = formatTimeStringToSeconds(inputValue);
    const delta = e.deltaY < 0 ? 0.01 : -0.01;
    const newValue = Math.max(min, Math.min(max, currentSeconds + delta));

    // log.debug('handleWheel', { currentSeconds, newValue, min, max });
    setInputValue(formatTimeToString(newValue));
    onChange?.(newValue);
    (e.target as HTMLInputElement).blur();
  };

  // if (description === 'Start') log.debug('TimeInput', inputValue);

  return (
    <div className='flex items-center gap-0'>
      <Input
        description={description}
        labelPlacement={'outside-left'}
        type='text'
        isDisabled={isDisabled}
        value={inputValue}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          handleChange(e);
          setKeyboardEnabled(true);
        }}
        onFocus={(e) => {
          setKeyboardEnabled(false);
          (e.target as HTMLInputElement).select();
        }}
        onWheel={handleWheel}
        classNames={{
          base: 'rounded-r-none',
          input: 'cursor-ns-resize'
        }}
      />
    </div>
  );
};
