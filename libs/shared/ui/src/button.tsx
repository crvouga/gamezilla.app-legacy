import { classNames } from './utils';

export type ButtonVariant = 'contained' | 'outlined' | 'text';

export type ButtonColor = 'primary' | 'danger' | 'default';

export type ButtonSize = 'sm' | 'md' | 'lg';

type VariantColor = `${ButtonVariant}-${ButtonColor}`;

export const MyButton = ({
  type,
  children,
  className,
  onClick,
  variant = 'contained',
  color = 'default',
  size = 'md',
  disabled,
}: {
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
}) => {
  const combo: VariantColor = `${variant}-${color}`;

  return (
    <button
      disabled={disabled}
      type={type}
      className={classNames(
        className,
        'font-bolder flex items-center justify-center gap-2 select-none flex-nowrap',
        combo === 'contained-primary' && 'bg-blue-500 text-white rounded-md',
        combo === 'contained-danger' && 'bg-red-500 text-white rounded-md',
        combo === 'contained-default' &&
          'bg-white/10 border border-neutral-700 text-white rounded-md',
        combo === 'outlined-default' &&
          'border border-neutral-700 text-inherit rounded-md',
        !disabled && combo === 'text-primary' && 'text-blue-500',
        size === 'lg' && 'text-xl py-3 px-3',
        size === 'md' && 'text-lg py-1 px-3',
        size === 'sm' && 'text-md py-1 px-3',
        disabled && 'opacity-50 cursor-not-allowed bg-neutral-600',
        !disabled && ' active:opacity-60'
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
