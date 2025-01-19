import { useState } from 'react';

import { useKeyboard } from '@helpers/keyboard/useKeyboard';
import { createLog } from '@helpers/log';
import { formatTimeStringToSeconds, formatTimeToString } from '@helpers/time';
import { Input } from '@nextui-org/react';

const log = createLog('TimeInput');

interface TimeInputProps {
  initialValue: number;
  description: string;
  onChange?: (value: number) => void;
}

export const TimeInput = ({
  initialValue,
  description,
  onChange
}: TimeInputProps) => {
  const { setIsEnabled: setKeyboardEnabled } = useKeyboard();
  const [inputValue, setInputValue] = useState<string>(
    formatTimeToString(initialValue)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    try {
      const newValue = formatTimeStringToSeconds(input);
      log.debug('handleChange', input, newValue);
      setInputValue(formatTimeToString(newValue));
      onChange?.(newValue);
    } catch {
      log.debug('Invalid time format', input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
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
      value={inputValue}
      onChange={handleInput}
      onKeyDown={handleKeyDown}
      onBlur={(e) => {
        handleChange(e);
        setKeyboardEnabled(true);
      }}
      onFocus={() => setKeyboardEnabled(false)}
    />
  );
};
