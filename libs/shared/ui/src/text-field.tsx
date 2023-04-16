import { MyButton } from './button';
import { Button } from './ui';
import { classNames } from './utils';

export const MyTextField = ({
  label,
  id,
  value,
  onChange,

  type,
  error,
  helperText,
  autoFocus,
}: {
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';
  autoFocus?: boolean;
  id: string;
  label: string;
  value: string;
  error?: boolean;
  helperText?: string;
  onClear?: () => void;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={classNames('text-sm', error && 'text-red-500')}
      >
        {label}
      </label>
      <input
        id={id}
        autoFocus={autoFocus}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={classNames(
          'border border-white/40 rounded-md text-lg p-2 bg-white/10 outline-none',
          error && 'border-red-500',
          !error && 'ring-blue-500 focus:ring-2'
        )}
      />

      {helperText && (
        <div className={classNames('text-sm', error && 'text-red-500')}>
          {helperText}
        </div>
      )}
    </div>
  );
};
