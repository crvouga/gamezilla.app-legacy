import { ReactNode, useRef } from 'react';
import { IconXMark } from './icon';
import { classNames } from './utils';

export const MyTextField = ({
  label,
  id,
  value,
  onChange,
  onClear,
  type,
  error,
  helperText,
  autoFocus,
  startIcon,
}: {
  startIcon?: ReactNode;
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={classNames('text-sm', error && 'text-red-500')}
      >
        {label}
      </label>

      <div
        className={classNames(
          'flex items-center border border-white/30 rounded-md text-lg p-3 bg-white/10 outline-none',
          error && 'border-red-500',
          !error && 'ring-blue-500 focus:ring-2'
        )}
      >
        {startIcon}
        <input
          id={id}
          ref={inputRef}
          autoFocus={autoFocus}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="outline-none flex-1 bg-transparent"
        />
        {onClear && (
          <button
            className="outline-none ring-blue-500 focus:ring-2 rounded-md"
            onClick={(event) => {
              event.preventDefault();
              inputRef.current?.focus();
              onClear();
            }}
          >
            <IconXMark />
          </button>
        )}
      </div>

      {helperText && (
        <div className={classNames('text-sm', error && 'text-red-500')}>
          {helperText}
        </div>
      )}
    </div>
  );
};
