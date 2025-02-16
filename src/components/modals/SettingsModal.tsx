'use client';

import { useMemo } from 'react';

import { createLog } from '@helpers/log';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/react';
import { useSettings } from '@hooks/useSettings';
import { useProjects } from '../../model/hooks/useProjects';
import { OpSwitch } from '../common/OpSwitch';
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
  const { deleteEverything } = useProjects();

  // const settings = JSON.parse(settingsString);

  // log.debug('render', settings);

  const items = useMemo(() => {
    return Settings.map((item) => ({
      ...item,
      value: getSetting(item.path)
    }));
  }, [getSetting]);

  const handleDeleteEverything = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete all data? This cannot be undone.'
      )
    ) {
      await deleteEverything();
      ref.current?.close();
    }
  };

  return (
    <CommonModal ref={ref} title='Settings'>
      <Table
        hideHeader
        aria-label='Settings'
        classNames={{
          wrapper: 'text-foreground bg-background',
          base: 'text-foreground max-h-[300px]',
          table: 'min-h-[300px]'
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

      <div className=''>
        <Button
          color='danger'
          onPress={handleDeleteEverything}
          className='w-full'
        >
          Delete All Data
        </Button>
      </div>
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
    <OpSwitch
      isSelected={value as boolean}
      isEnabled={true}
      onChange={(value: boolean) => {
        // setValue(value);
        onChange(value);
      }}
    />
  );
};
