import { Combobox } from '@headlessui/react';
import { Fragment } from 'react';
import { classNames } from './utils';

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
}: {
  className?: string;
  value: TValue;
  onChange: (value: TValue) => void;
  valueQuery: string;
  onChangeQuery: (query: string) => void;
  label: string;
  options: TValue[];
  toKey: (value: TValue) => string;
  toLabel: (value: TValue) => string;
}) => {
  return (
    <Combobox value={value} onChange={onChange}>
      <div className={className}>
        <Combobox.Label className="block text-sm font-medium w-full">
          {label}
        </Combobox.Label>

        <div className="relative mt-2">
          <Combobox.Input
            value={valueQuery}
            onChange={(event) => onChangeQuery(event.target.value)}
            displayValue={(selected: TValue) => {
              return toLabel(selected);
            }}
            className="border border-white/40 rounded-md text-lg p-2 bg-white/10 w-full"
          />

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
                      className={classNames(
                        'p-4',
                        active && 'text-white bg-blue-500'
                      )}
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
