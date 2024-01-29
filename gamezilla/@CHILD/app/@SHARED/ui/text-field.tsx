import { IconXMark } from "./icon";
import { VDom, cn } from "./ui";

export const TextField = ({
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
  helperText?: string | null;
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
          "flex appearance-none items-center gap-2 rounded-md border border-neutral-600 bg-neutral-800 p-3 py-4 text-xl outline-none",
          error && "border border-red-500 text-red-500",
          !error && " ring-blue-600 focus-within:ring-2"
        )}
      >
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
        {onClear && value && value?.toString().length > 0 && (
          <button
            className="rounded-md outline-none ring-blue-600 focus:ring-2"
            aria-label="Clear input"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.focus();
              onClear();
            }}
          >
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
