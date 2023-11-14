import { IconXMark } from "./icon";
import { VDom, cn } from "./utils";

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
  min,
  max,
  step,
}: {
  startIcon?: VDom;
  type?: "text" | "password" | "email" | "number" | "search" | "tel" | "url";
  autoFocus?: boolean;
  id: string;
  label: string;
  value?: string | number;
  error?: boolean;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  onClear?: () => void;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className={cn("text-base", error && "text-red-500")}>
        {label}
      </label>

      <div
        className={cn(
          "flex items-center rounded-md bg-white/10 p-3 py-4 text-lg outline-none",
          error && "border border-red-500 text-red-500",
          !error && " ring-blue-600 focus:ring-2"
        )}>
        {startIcon}
        <input
          id={id}
          autoFocus={autoFocus}
          type={type}
          value={value}
          min={min}
          max={max}
          auto-complete="off"
          auto-capitalize="off"
          auto-correct="off"
          auto-save="off"
          step={step}
          onInput={(e) => {
            e.preventDefault();
            onChange(e.currentTarget.value);
          }}
          className="w-auto flex-1 bg-transparent outline-none"
        />
        {onClear && (
          <button
            className="rounded-md outline-none ring-blue-600 focus:ring-2"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById(id)?.focus();
              onClear();
            }}>
            <IconXMark className="h-6 w-6" />
          </button>
        )}
      </div>

      {helperText && (
        <div className={cn("text-sm", error && "text-red-500")}>
          {helperText}
        </div>
      )}
    </div>
  );
};
