import { useImperativeHandle, useState } from 'react';

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
  description: string;
  isDisabled?: boolean;
  onChange?: (value: number) => void;
}

export const TimeInput = ({
  ref,
  initialValue,
  defaultValue,
  description,
  isDisabled,
  onChange
}: TimeInputProps) => {
  const { setIsEnabled: setKeyboardEnabled } = useKeyboard();
  const [inputValue, setInputValue] = useState<string>(
    formatTimeToString(initialValue)
  );

  useImperativeHandle(ref, () => ({
    setValue: (value: number) => {
      setInputValue(formatTimeToString(value));
    },
    getValue: () => {
      return formatTimeStringToSeconds(inputValue);
    }
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    try {
      const newValue = formatTimeStringToSeconds(input);
      log.debug('handleChange', input, newValue);
      setInputValue(formatTimeToString(newValue));
      onChange?.(newValue);
    } catch {
      log.debug('Invalid time format', input);
      setInputValue(formatTimeToString(defaultValue ?? 0));
      onChange?.(defaultValue ?? 0);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setKeyboardEnabled(false);
    // select the text
    (e.target as HTMLInputElement).select();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
      // unfocus the input
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
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
      onFocus={handleFocus}
    />
  );
};
