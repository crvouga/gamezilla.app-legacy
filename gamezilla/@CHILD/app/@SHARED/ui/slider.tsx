export const Slider = ({
  label,
  max,
  min,
  step,
  value,
  onInput,
}: {
  value: number;
  label: string;
  min: number;
  max: number;
  step: number;
  onInput?: (newValue: number) => void;
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
        onInput={(event) => {
          if (!event.target) {
            return;
          }
          const val = "value" in event.target ? event.target.value : "";
          const parsed = typeof val === "string" ? parseFloat(val) : NaN;
          if (isNaN(parsed)) {
            return;
          }
          onInput?.(parsed);
        }}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-blue-500"
      />
    </div>
  );
};
