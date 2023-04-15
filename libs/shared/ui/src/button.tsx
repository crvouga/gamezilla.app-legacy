export type ButtonVariant = 'contained' | 'outlined';

export type ButtonColor = 'primary' | 'danger' | 'default';

export type ButtonSize = 'sm' | 'md' | 'lg';

type VariantColor = `${ButtonVariant}-${ButtonColor}`;

export const MyButton = ({
  children,
  className,
  onClick,
  variant = 'contained',
  color = 'default',
  size = 'md',
}: {
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
      className={[
        className ? className : '',
        'font-bold flex items-center justify-center gap-2 active:opacity-60',
        combo === 'contained-danger' ? 'bg-red-500 text-white rounded-md' : '',
        combo === 'contained-default'
          ? 'bg-neutral-900 border-neutral-700 text-white rounded-md'
          : '',
        combo === 'outlined-default'
          ? 'border border-neutral-700 text-inherit rounded-md'
          : '',
        size === 'lg' ? 'text-xl py-3 px-3' : '',
        size === 'md' ? 'text-lg py-1 px-3' : '',
        size === 'sm' ? 'text-md py-1 px-3' : '',
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
