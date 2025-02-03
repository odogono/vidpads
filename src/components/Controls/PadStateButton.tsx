import { Button } from '@nextui-org/react';

export const PadStateButton = ({
  label,
  onPress,
  isActive,
  isEnabled
}: {
  label: string;
  onPress: () => void;
  isActive: boolean;
  isEnabled?: boolean;
}) => {
  return (
    <Button
      className={
        isActive
          ? 'bg-slate-900 border-default-200'
          : 'bg-slate-600 text-foreground border-default-200'
      }
      onPress={onPress}
      color='primary'
      variant={isActive ? 'solid' : 'flat'}
      radius='full'
      isDisabled={!isEnabled}
    >
      {label}
    </Button>
  );
};
