import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';

import { createLog } from '@helpers/log';
import { roundNumberToDecimalPlaces, safeParseFloat } from '@helpers/number';
import { clearRunAfter, runAfter, type TimeoutId } from '@helpers/time';
import { cn } from '@heroui/react';
import { useKeyboard } from '@hooks/useKeyboard';

const log = createLog('OpIntegerInput', ['debug']);

export interface OpIntegerInputRef {
  setValue: (value: number) => void;
  getValue: () => number;
}
interface OpIntegerInputProps {
  label?: string;
  labelPlacement?: 'left' | 'right' | 'bottom';
  ref?: React.RefObject<OpIntegerInputRef | null>;
  initialValue: number;
  defaultValue?: number | undefined;
  range?: [number, number];
  description: string;
  onChange?: (value: number) => void;
  showIncrementButtons?: boolean;
  isEnabled?: boolean;
  allowNumbers?: boolean;
}

const bpmToString = (value: number) => {
  return roundNumberToDecimalPlaces(value, 1).toString();
};

const stringToBpm = (value: string) => safeParseFloat(value);

export const OpIntegerInput = ({
  label,
  labelPlacement = 'bottom',
  ref,
  initialValue,
  defaultValue,
  onChange,
  range,
  isEnabled
}: OpIntegerInputProps) => {
  const { isMetaKeyDown, setIsEnabled: setKeyboardEnabled } = useKeyboard();
  const [inputValue, setInputValue] = useState<string>(
    bpmToString(initialValue)
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const lastValue = useRef<number>(initialValue);
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);
  const dragTimeout = useRef<TimeoutId | undefined>(undefined);

  useEffect(() => setInputValue(bpmToString(initialValue)), [initialValue]);

  useImperativeHandle(ref, () => ({
    setValue: (value: number) => {
      // Don't update the input value if this specific input has focus
      if (document.activeElement === inputRef.current) {
        return;
      }
      setInputValue(bpmToString(value));
    },
    getValue: () => {
      return stringToBpm(inputValue);
    }
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // log.debug('handleChange', input);
    try {
      const newValue = stringToBpm(input);
      log.debug('handleChange', input, newValue, bpmToString(newValue));
      setInputValue(bpmToString(newValue));
      onChange?.(newValue);
    } catch {
      log.debug('Invalid integer format', input);
      setInputValue(bpmToString(defaultValue ?? 0));
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

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLInputElement>) => {
      if (!isEnabled) return;
      // const isMeta = isMetaKeyDown();

      const increment = 1;

      const [min, max] = range ? range : [0, 100];

      const currentSeconds = stringToBpm(inputValue);
      log.debug('handleWheel', { currentSeconds, min, max, inputValue, range });
      const delta = e.deltaY < 0 ? increment : -increment;
      const newValue = Math.max(min, Math.min(max, currentSeconds + delta));
      // log.debug('handleWheel', { newValue });

      log.debug('handleWheel', { currentSeconds, newValue, min, max });
      setInputValue(bpmToString(newValue));
      onChange?.(newValue);
      (e.target as HTMLInputElement).blur();
    },
    [isEnabled, range, inputValue, onChange]
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
      const baseSensitivity = isMetaKeyDown() ? 0.1 : 1;

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
      setInputValue(bpmToString(newValue));
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
      lastValue.current = stringToBpm(inputValue);
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
      className={cn('vo-int-input flex items-center gap-2', {
        'flex-row ': labelPlacement === 'right',
        'flex-row-reverse': labelPlacement === 'left',
        'flex-col': labelPlacement === 'bottom'
      })}
    >
      <input
        ref={inputRef}
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
          className='text-xs text-foreground/90'
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
