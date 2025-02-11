import { cn } from '@helpers/tailwind';

export const OpLabel = ({
  label,
  isEnabled
}: {
  label: string | undefined;
  isEnabled: boolean;
}) => {
  if (!label) return null;
  return (
    <div
      className={cn('text-xs mt-2', {
        'text-foreground/90': isEnabled,
        'text-foreground/60': !isEnabled
      })}
      style={{
        fontSize: '0.6rem',
        lineHeight: '0.75rem'
      }}
    >
      {label}
      {isEnabled}
    </div>
  );
};
