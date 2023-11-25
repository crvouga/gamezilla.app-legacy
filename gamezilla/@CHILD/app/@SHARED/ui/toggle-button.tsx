export const ToggleButton = ({
  id,
  onToggle,
  checked,
}: {
  id: string;
  checked: boolean;
  onToggle?: (state: boolean) => void;
}) => {
  return (
    <label class="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" value="" class="peer sr-only" checked={checked} />
      <div class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-500 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-500"></div>
    </label>
  );
};
