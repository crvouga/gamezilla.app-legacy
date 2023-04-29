import { Combobox } from '@headlessui/react';
import { Fragment, ReactNode, useRef } from 'react';
import { cn } from './utils';
import { IconXMark } from './icon';

export const Autocomplete = <TValue,>({
  className,
  value,
  onChange,
  valueQuery,
  onChangeQuery,
  label,
  options,
  toKey,
  toLabel,
  onClear,
  startIcon,
}: {
  startIcon?: ReactNode;
  className?: string;
  value: TValue;
  onChange: (value: TValue) => void;
  valueQuery: string;
  onChangeQuery: (query: string) => void;
  label: string;
  options: TValue[];
  toKey: (value: TValue) => string;
  toLabel: (value: TValue) => string;
  onClear?: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <Combobox value={value} onChange={onChange}>
      <div className={className}>
        <Combobox.Label className="block text-sm font-medium w-full">
          {label}
        </Combobox.Label>

        <div className="relative mt-2">
          <div className="flex items-center border border-white/40 rounded-md text-lg bg-white/10 w-full">
            {startIcon}
            <Combobox.Input
              ref={inputRef}
              className="flex-1 p-3 bg-transparent outline-none"
              value={valueQuery}
              onChange={(event) => onChangeQuery(event.target.value)}
              displayValue={(selected: TValue) => {
                return toLabel(selected);
              }}
            />
            {onClear && (
              <button
                onClick={(event) => {
                  event.preventDefault();
                  inputRef.current?.focus();
                  onClear();
                }}
                className="outline-none h-full mr-2 ring-blue-500 focus:ring-2 rounded-md"
              >
                <IconXMark />
              </button>
            )}
          </div>

          {options.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-neutral-600 py-1 text-base">
              {options.map((option) => (
                <Combobox.Option
                  key={toKey(option)}
                  value={toKey(option)}
                  as={Fragment}
                >
                  {({ active }) => (
                    <li
                      className={cn('p-4', active && 'text-white bg-blue-500')}
                    >
                      {toLabel(option)}
                    </li>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </div>
    </Combobox>
  );
};
