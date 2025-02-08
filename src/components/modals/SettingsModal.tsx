'use client';

import { useMemo } from 'react';

import { createLog } from '@helpers/log';
import {
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/react';
import { useSettings } from '@model/hooks/useSettings';
import { CommonModal, CommonModalBase } from './CommonModal';

const log = createLog('SettingsModal', ['debug']);

interface SettingDef {
  label: string;
  description: string;
  type: 'boolean' | 'number' | 'string';
  path: string;
}

const Settings: SettingDef[] = [
  {
    label: 'Pad Play',
    description: 'Enable pad play',
    type: 'boolean',
    path: 'isPadPlayEnabled'
  },
  {
    label: 'Keyboard Play',
    description: 'Enable keyboard play',
    type: 'boolean',
    path: 'isKeyboardPlayEnabled'
  },
  {
    label: 'Midi Play',
    description: 'Enable midi play',
    type: 'boolean',
    path: 'isMidiPlayEnabled'
  },
  {
    label: 'Hide Player On End',
    description: 'Whether the player hides when it ends',
    type: 'boolean',
    path: 'hidePlayerOnEnd'
  },
  {
    label: 'Select Pad From Keyboard',
    description: 'Whether a keyboard event selects the pad',
    type: 'boolean',
    path: 'selectPadFromKeyboard'
  },
  {
    label: 'Select Pad From Midi',
    description: 'Whether a midi event selects the pad',
    type: 'boolean',
    path: 'selectPadFromMidi'
  },
  {
    label: 'Select Pad From Pad',
    description: 'Whether a pad event selects the pad',
    type: 'boolean',
    path: 'selectPadFromPad'
  }
];

export const SettingsModal = ({ ref }: CommonModalBase) => {
  const { updateSetting, getSetting } = useSettings();

  // const settings = JSON.parse(settingsString);

  // log.debug('render', settings);

  const items = useMemo(() => {
    return Settings.map((item) => ({
      ...item,
      value: getSetting(item.path)
    }));
  }, [getSetting]);

  return (
    <CommonModal ref={ref} title='Settings'>
      <Table
        hideHeader
        aria-label='Settings'
        className=''
        classNames={{
          wrapper: 'text-foreground bg-background',
          base: 'text-foreground'
        }}
      >
        <TableHeader>
          <TableColumn>Name</TableColumn>
          <TableColumn>Value</TableColumn>
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.path}>
              <TableCell>{item.label}</TableCell>
              <TableCell>
                <BooleanSetting
                  setting={item}
                  value={item.value}
                  onChange={(value) => updateSetting(item.path, value)}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CommonModal>
  );
};

interface SettingRowProps {
  setting: SettingDef;
  value?: boolean | number | string;
  onChange: (value: boolean | number | string) => void;
}

const BooleanSetting = ({ setting, value, onChange }: SettingRowProps) => {
  log.debug('setting', setting.label, value);

  return (
    <Switch
      size='md'
      isSelected={value as boolean}
      onValueChange={(value: boolean) => {
        // setValue(value);
        onChange(value);
      }}
    />
  );
};
// const SettingRow = ({ setting, value, onChange }: SettingRowProps) => {
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue =
//       setting.type === 'boolean'
//         ? e.target.checked
//         : setting.type === 'number'
//           ? Number(e.target.value)
//           : e.target.value;

//     onChange(newValue);
//   };

//   return (
//     <TableRow>
//       <TableCell>{setting.label}</TableCell>
//       <TableCell>
//         {setting.type === 'boolean' ? (
//           <input
//             type='checkbox'
//             checked={value as boolean}
//             onChange={handleChange}
//           />
//         ) : setting.type === 'number' ? (
//           <input
//             type='number'
//             value={value as number}
//             onChange={handleChange}
//           />
//         ) : (
//           <input type='text' value={value as string} onChange={handleChange} />
//         )}
//       </TableCell>
//     </TableRow>
//   );
// };
