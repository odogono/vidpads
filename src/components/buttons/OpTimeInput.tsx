import { useEffect, useImperativeHandle, useState } from 'react';

import { useKeyboard } from '@helpers/keyboard/useKeyboard';
import { createLog } from '@helpers/log';
import { formatTimeStringToSeconds, formatTimeToString } from '@helpers/time';
import { cn } from '@nextui-org/react';

const log = createLog('OpTimeInput');

export interface OpTimeInputRef {
  setValue: (value: number) => void;
  getValue: () => number;
}
interface OpTimeInputProps {
  label?: string;
  ref?: React.RefObject<OpTimeInputRef | null>;
  initialValue: number;
  defaultValue?: number | undefined;
  range?: [number, number];
  description: string;
  isDisabled?: boolean;
  onChange?: (value: number) => void;
  showIncrementButtons?: boolean;
}

export const OpTimeInput = ({
  label,
  ref,
  initialValue,
  defaultValue,
  isDisabled,
  onChange,
  range
}: OpTimeInputProps) => {
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
    if (isDisabled) return;

    const [min, max] = range ? range : [0, 100];

    const currentSeconds = formatTimeStringToSeconds(inputValue);
    // log.debug('handleWheel', { currentSeconds, min, max });
    const delta = e.deltaY < 0 ? 0.01 : -0.01;
    const newValue = Math.max(min, Math.min(max, currentSeconds + delta));
    // log.debug('handleWheel', { newValue });

    // log.debug('handleWheel', { currentSeconds, newValue, min, max });
    setInputValue(formatTimeToString(newValue));
    onChange?.(newValue);
    (e.target as HTMLInputElement).blur();
  };

  // if (description === 'Start') log.debug('TimeInput', inputValue);

  return (
    <div className='time-input flex flex-col items-center justify-center'>
      <input
        className={cn(
          `rounded-r-none cursor-ns-resize bg-default-100 px-3 py-1 text-sm min-h-unit-8  utline-none w-[7.5rem] font-mono`,
          'hover:border-default-400 ',
          isDisabled ? 'bg-gray-800 text-gray-500' : ''
        )}
        type='text'
        disabled={isDisabled}
        value={inputValue}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          handleChange(e);
          setKeyboardEnabled(true);
        }}
        onFocus={(e) => {
          setKeyboardEnabled(false);
          e.target.select();
        }}
        onWheel={handleWheel}
      />
      {label && (
        <div
          className='text-xs text-foreground/90 mt-2'
          style={{
            fontSize: '0.6rem',
            lineHeight: '0.75rem'
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
