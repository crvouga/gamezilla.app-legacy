import { ReactNode, useRef } from "react";
import { IconXMark } from "./icon";
import { cn } from "./utils";

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
  startIcon?: ReactNode;
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className={cn("text-base", error && "text-red-500")}>
        {label}
      </label>

      <div
        className={cn(
          "flex items-center rounded-md bg-white/10 p-3 text-lg outline-none",
          error && "border border-red-500 text-red-500",
          !error && " ring-blue-500 focus:ring-2"
        )}>
        {startIcon}
        <input
          id={id}
          ref={inputRef}
          autoFocus={autoFocus}
          type={type}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none"
          style={{ width: "auto" }}
        />
        {onClear && (
          <button
            className="rounded-md outline-none ring-blue-500 focus:ring-2"
            onClick={(event) => {
              event.preventDefault();
              inputRef.current?.focus();
              onClear();
            }}>
            <IconXMark />
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
