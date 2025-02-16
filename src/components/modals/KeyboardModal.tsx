'use client';

import { useMemo } from 'react';

// import { createLog } from '@helpers/log';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/react';
import { useKeyboard } from '@hooks/useKeyboard';
import { CommonModal, CommonModalBase } from './CommonModal';

// const log = createLog('KeyboardModal', ['debug']);

export const KeyboardModal = ({ ref }: CommonModalBase) => {
  const { resetKeyMap, keyMap } = useKeyboard();

  const items = useMemo(() => {
    return Object.entries(keyMap).map(([key, value]) => ({
      ...value,
      key
    }));
  }, [keyMap]);

  const handleResetMappings = async () => {
    if (
      window.confirm('Are you sure you want to reset the keyboard mappings?')
    ) {
      resetKeyMap();
    }
  };

  return (
    <CommonModal ref={ref} title='Keyboard'>
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
            <TableRow key={item.key}>
              <TableCell>{item.label}</TableCell>
              <TableCell>{item.key}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className=''>
        <Button color='danger' onPress={handleResetMappings} className='w-full'>
          Reset Mappings
        </Button>
      </div>
    </CommonModal>
  );
};
