import React from "react";

export const TextField = ({
  value,
  label,
  onChange,
  placeholder,
  id,
}: {
  id?: string;
  label?: string;
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
}) => {
  return (
    <div>
      {label && (
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        value={value}
        onChange={(event) => {
          onChange?.(event.target.value);
        }}
        className="shadow appearance-none rounded w-full p-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        placeholder={placeholder}
      />
    </div>
  );
};
