import { Button } from '@nextui-org/react';

export const PadStateButton = ({
  label,
  onPress,
  isActive
}: {
  label: string;
  onPress: () => void;
  isActive: boolean;
}) => {
  return (
    <Button
      className={
        isActive
          ? 'bg-primary border-default-200'
          : 'text-foreground border-default-200'
      }
      onPress={onPress}
      color='primary'
      variant={isActive ? 'solid' : 'flat'}
      radius='full'
    >
      {label}
    </Button>
  );
};
