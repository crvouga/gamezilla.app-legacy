export const Slider = ({
  label,
  max,
  min,
  step,
  value,
  onChange,
}: {
  value: number;
  label: string;
  min: number;
  max: number;
  step: number;
  onChange?: (newValue: number) => void;
}) => {
  return (
    <div>
      <p className="text-base">{label}</p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={(event) => {
          const val = event.target.value;
          const parsed = parseFloat(val);
          if (isNaN(parsed)) {
            return;
          }
          onChange?.(parsed);
        }}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
      />
    </div>
  );
};
