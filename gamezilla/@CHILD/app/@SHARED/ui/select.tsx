import { IconXMark } from "./icon";
import { VDom, cn } from "./utils";

export const Select = <T,>({
  onChange,
  options,
  value,
  label,
  id,
  toKey,
  toName,
  error,
  helperText,
  startIcon,
}: {
  helperText?: string;
  id: string;
  label: string;
  options: T[];
  value?: T | null;
  error?: boolean;
  toKey: (option: T) => string;
  toName: (option: T) => string;
  startIcon?: VDom;
  onChange: (value: T) => void;
}) => {
  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className={cn("text-base", error && "text-red-500")}>
        {label}
      </label>

      <select
        className={cn(
          "flex appearance-none items-center rounded-md bg-white/10 p-3 py-4 text-lg outline-none",
          error && "border border-red-500 text-red-500",
          !error && " ring-blue-600 focus:ring-2"
        )}>
        {options.map((option) => {
          return (
            <option key={option} value={toKey(option)}>
              {toName(option)}
            </option>
          );
        })}
      </select>

      {helperText && (
        <div className={cn("text-sm", error && "text-red-500")}>
          {helperText}
        </div>
      )}
    </div>
  );
};
