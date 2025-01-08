import { ButtonHTMLAttributes } from 'react';

import classNames from 'classnames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={classNames(
        'rounded-md font-medium transition-colors',
        {
          // Variant styles
          'bg-blue-500 text-white hover:bg-blue-600':
            variant === 'primary' && !disabled,
          'bg-gray-200 text-gray-800 hover:bg-gray-300':
            variant === 'secondary' && !disabled,

          // Disabled state
          'opacity-50 cursor-not-allowed': disabled,

          // Size styles
          'px-2 py-1 text-sm': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-lg': size === 'lg'
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
