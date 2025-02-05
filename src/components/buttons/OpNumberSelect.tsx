import { useCallback, useMemo, useState } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@nextui-org/react';
import { OpButton } from './OpButton';

interface OpNumberSelectProps {
  label: string;
  isEnabled: boolean;
  onChange?: (value: number) => void;
  value?: number;
}

const items = [
  { key: -1, label: 'Off' },
  ...Array.from({ length: 5 }, (_, i) => ({
    key: i + 1,
    label: `${i + 1}`
  }))
];

export const OpNumberSelect = ({
  label,
  isEnabled,
  onChange,
  value
}: OpNumberSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setIsOpen(isOpen);
  }, []);

  const trigger = useMemo(() => {
    const btnLabel = items.find((item) => item.key === value)?.label ?? 'Off';
    return (
      <OpButton label={label} isEnabled={isEnabled}>
        {btnLabel}
      </OpButton>
    );
  }, [isEnabled, label, value]);

  if (!isEnabled) {
    return trigger;
  }

  return (
    <Dropdown
      className='bg-slate-600'
      showArrow
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DropdownTrigger>{trigger}</DropdownTrigger>
      <DropdownMenu
        items={items}
        onAction={(key) => {
          // setValue(Number(key));
          onChange?.(Number(key));
        }}
      >
        {(item) => <DropdownItem key={item.key}>{item.label}</DropdownItem>}
      </DropdownMenu>
    </Dropdown>
  );
};
