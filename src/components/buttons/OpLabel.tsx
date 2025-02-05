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
      className={`text-xs text-foreground/90 mt-2 ${
        isEnabled ? 'text-foreground/90' : 'text-foreground/60'
      }`}
      style={{
        fontSize: '0.6rem',
        lineHeight: '0.75rem'
      }}
    >
      {label}
    </div>
  );
};
