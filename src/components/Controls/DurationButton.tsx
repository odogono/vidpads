import { Button } from '@nextui-org/react';

export const DurationButton = ({
  children,
  onPress
}: {
  children: React.ReactNode;
  onPress: () => void;
}) => {
  return (
    <Button isIconOnly radius='full' variant='light' onPress={onPress}>
      {children}
    </Button>
  );
};
