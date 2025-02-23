import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';

import { createLog } from '@helpers/log';
import {
  clearRunAfter,
  formatTimeStringToSeconds,
  formatTimeToString,
  runAfter,
  type TimeoutId
} from '@helpers/time';
import { cn } from '@heroui/react';
import { useKeyboard } from '@hooks/useKeyboard';

const log = createLog('OpTimeInput', ['debug']);

export interface OpTimeInputRef {
  setValue: (value: number | undefined) => void;
  getValue: () => number;
}
interface OpTimeInputProps {
  label?: string;
  ref?: React.RefObject<OpTimeInputRef | null>;
  initialValue: number;
  defaultValue?: number | undefined;
  range?: [number, number];
  description: string;
  onChange?: (value: number) => void;
  showIncrementButtons?: boolean;
  isEnabled?: boolean;
  labelPlacement?: 'left' | 'right' | 'bottom';
}

export const OpTimeInput = ({
  label,
  labelPlacement = 'bottom',
  ref,
  initialValue,
  defaultValue,
  onChange,
  range,
  isEnabled
}: OpTimeInputProps) => {
  const {
    isAltKeyDown,
    isMetaKeyDown,
    isShiftKeyDown,
    setIsEnabled: setKeyboardEnabled
  } = useKeyboard();
  const [inputValue, setInputValue] = useState<string>(
    formatTimeToString(initialValue)
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const lastValue = useRef<number>(initialValue);
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);
  const dragTimeout = useRef<TimeoutId | undefined>(undefined);

  useEffect(() => {
    // log.debug('TimeInput', description, initialValue);
    setInputValue(formatTimeToString(initialValue));
  }, [initialValue]);

  useImperativeHandle(ref, () => ({
    setValue: (value: number | undefined) => {
      if (value === undefined) {
        setInputValue('---:---:---');
      } else {
        setInputValue(formatTimeToString(value));
      }
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
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      incrementTime(1, e.altKey, e.shiftKey, e.metaKey);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      incrementTime(-1, e.altKey, e.shiftKey, e.metaKey);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // log.debug('handleInput', e.target.value);
    setInputValue(e.target.value);
  };

  const incrementTime = useCallback(
    (delta: number, isAlt: boolean, isShift: boolean, isMeta: boolean) => {
      if (!isEnabled) return;

      if (isAlt) delta *= 0.1;
      if (isShift) delta *= 0.1;
      if (isMeta) delta *= 0.1;

      const [min, max] = range ? range : [0, 100];
      const currentSeconds = formatTimeStringToSeconds(inputValue);
      const newValue = Math.max(min, Math.min(max, currentSeconds + delta));

      // log.debug('incrementTime', { delta, isShift, isMeta, newValue });

      setInputValue(formatTimeToString(newValue));
      onChange?.(newValue);
    },
    [isEnabled, range, inputValue, onChange]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLInputElement>) => {
      const isShift = isShiftKeyDown();
      const isMeta = isMetaKeyDown();
      const isAlt = isAltKeyDown();

      incrementTime(e.deltaY < 0 ? 0.01 : -0.01, isAlt, isShift, isMeta);

      (e.target as HTMLInputElement).blur();
    },
    [incrementTime, isAltKeyDown, isMetaKeyDown, isShiftKeyDown]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      if (!isDragging || !isEnabled) return;

      const dx = lastPointerPos.current
        ? e.clientX - lastPointerPos.current.x
        : 0;
      const dy = lastPointerPos.current
        ? e.clientY - lastPointerPos.current.y
        : 0;

      // Update last position
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      // Calculate base sensitivity
      const baseSensitivity = isMetaKeyDown() ? 0.0001 : 0.001;

      // Calculate movement magnitude and apply exponential scaling
      const movement = dx - dy;
      const exponentialFactor = 1.8; // Adjust this to control how quickly sensitivity increases
      const scaledDelta =
        Math.sign(movement) *
        Math.pow(Math.abs(movement), exponentialFactor) *
        baseSensitivity;

      const [min, max] = range ? range : [0, 100];
      const currentSeconds = lastValue.current;
      const newValue = Math.max(
        min,
        Math.min(max, currentSeconds + scaledDelta)
      );

      lastValue.current = newValue;
      setInputValue(formatTimeToString(newValue));
      onChange?.(newValue);
    },
    [isDragging, isEnabled, isMetaKeyDown, range, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    if (!isEnabled) return;

    // Start a timeout to initiate drag after a short delay
    dragTimeout.current = runAfter(200, () => {
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      lastPointerPos.current = { x: e.clientX, y: e.clientY };
      lastValue.current = formatTimeStringToSeconds(inputValue);
      document.body.style.cursor = 'ew-resize';
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    });
  };

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      if (dragTimeout.current) {
        dragTimeout.current = clearRunAfter(dragTimeout.current);
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setIsDragging(false);
      dragStartPos.current = null;
      lastPointerPos.current = null;
      document.body.style.cursor = 'default';
    },
    []
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      dragTimeout.current = clearRunAfter(dragTimeout.current);
    };
  }, []);

  return (
    <div
      className={cn('vo-time-input flex items-center gap-2', {
        'flex-row ': labelPlacement === 'right',
        'flex-row-reverse ': labelPlacement === 'left',
        'flex-col justify-center': labelPlacement === 'bottom'
      })}
    >
      <input
        className={cn(
          `rounded-r-none cursor-ns-resize text-sm outline-none w-[6.8rem] font-mono text-center`,
          'hover:border-default-400 ',
          {
            'bg-secondary-800 text-secondary-500': !isEnabled,
            'hover:bg-primary-300 bg-primary-400': isEnabled,
            'cursor-ew-resize': isDragging
          }
        )}
        type='text'
        disabled={!isEnabled}
        value={inputValue}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
        onBlur={(e) => {
          if (!isDragging) {
            handleChange(e);
            setKeyboardEnabled(true);
          }
        }}
        onFocus={(e) => {
          setKeyboardEnabled(false);
          e.target.select();
        }}
        onWheel={handleWheel}
      />
      {label && (
        <div
          className='text-xs text-foreground/90 '
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
