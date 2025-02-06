import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Skeleton
} from "@heroui/react";

export const ControlsLoading = () => {
  return (
    <Card className='mt-4 w-auto max-w-2xl h-[130px] mx-auto bg-gray-800'>
      <CardHeader className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-24 rounded-lg' />
        </div>
        <div className='flex gap-2'>
          {/* Skeleton buttons */}
          {['One Shot', 'Loop', 'Edit', 'Delete'].map((label) => (
            <Button
              key={label}
              className='text-foreground border-default-200'
              variant='flat'
              radius='full'
              isDisabled
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardBody>
        <div className='w-full'>
          <Skeleton className='h-8 w-full rounded-lg' />
        </div>
      </CardBody>
    </Card>
  );
};
