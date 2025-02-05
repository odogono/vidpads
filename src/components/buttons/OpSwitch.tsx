'use client';

import { Switch } from '@nextui-org/react';
import { OpLabel } from './OpLabel';

export const OpSwitch = ({
  label,
  isSelected,
  isEnabled,
  onChange
}: {
  label: string;
  isSelected: boolean;
  isEnabled: boolean;
  onChange: (value: boolean) => void;
}) => {
  return (
    <div className='flex flex-col items-center justify-center '>
      <div className='h-12 flex items-center justify-center'>
        <Switch
          size='md'
          isSelected={isSelected}
          onValueChange={(value: boolean) => onChange(value)}
          isDisabled={!isEnabled}
        />
      </div>
      <OpLabel label={label} isEnabled={isEnabled} />
    </div>
  );
};
