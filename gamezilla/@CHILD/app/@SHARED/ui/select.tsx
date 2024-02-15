import { VDom } from "gamezilla/@SHARED/vdom"
import { cn } from "./ui"

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
}: {
  helperText?: string
  id: string
  label: string
  options: T[]
  value?: T | null
  error?: boolean
  toKey: (option: T) => string
  toName: (option: T) => string
  startIcon?: VDom
  onChange: (value: T) => void
}) => {
  const labelId = `${id}-label`
  return (
    <div className="flex w-full flex-col gap-1">
      <label
        id={labelId}
        htmlFor={id}
        className={cn("text-base", error && "text-red-500")}
      >
        {label}
      </label>

      <select
        id={id}
        className={cn(
          "flex appearance-none items-center rounded-md border border-neutral-600 bg-neutral-800 p-3 py-4 text-xl outline-none",
          error && "border border-red-500 text-red-500",
          !error && " ring-blue-600 focus:ring-2",
        )}
        aria-labelledby={labelId}
        value={value ? toKey(value) : undefined}
        onChange={(e) => {
          for (const option of options) {
            if (toKey(option) === e.currentTarget.value) {
              onChange(option)
              return
            }
          }
        }}
      >
        {options.map((option) => {
          return (
            <option key={toKey(option)} value={toKey(option)}>
              {toName(option)}
            </option>
          )
        })}
      </select>

      {helperText && (
        <div className={cn("text-sm", error && "text-red-500")}>
          {helperText}
        </div>
      )}
    </div>
  )
}
