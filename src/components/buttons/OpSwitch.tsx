'use client';

import { Switch } from "@heroui/react";
import { OpLabel } from './OpLabel';

export const OpSwitch = ({
  label,
  isSelected,
  isEnabled,
  onChange
}: {
  label: string;
  isSelected: boolean | undefined;
  isEnabled: boolean;
  onChange: (value: boolean) => void;
}) => {
  // const [value, setValue] = useState(isSelected ?? false);
  return (
    <div className='flex flex-col items-center justify-center '>
      <div className='h-12 flex items-center justify-center'>
        <Switch
          size='md'
          isSelected={isSelected ?? false}
          onValueChange={(value: boolean) => {
            // setValue(value);
            onChange(value);
          }}
          isDisabled={!isEnabled}
        />
      </div>
      <OpLabel label={label} isEnabled={isEnabled} />
    </div>
  );
};
