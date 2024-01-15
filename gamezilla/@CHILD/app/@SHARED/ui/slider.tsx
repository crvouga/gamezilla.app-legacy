export const Slider = ({
    label,
    max,
    min,
    step,
}: {
    label: string
    min: number;
    max: number;
    step: number;
}) => {
    return (
        <div>
            <p className="text-base">
                {label}
            </p>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
            />
        </div>
    );
};
