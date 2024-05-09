export const ToggleButton = ({
	onToggle,
	checked,
	label,
}: {
	label: string;
	id: string;
	checked: boolean;
	onToggle?: (e: Event) => void;
}) => {
	const onChange = (e: Event) => {
		e.stopPropagation();
		e;
		e.preventDefault();
		if (onToggle) {
			onToggle(e);
		}
	};

	return (
		<label className="relative inline-flex cursor-pointer items-center">
			<input
				aria-label={label}
				type="checkbox"
				value=""
				className="peer sr-only"
				checked={checked}
				onChange={onChange}
			/>
			<div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:start-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-500 rtl:peer-checked:after:-translate-x-full dark:border-neutral-700 dark:bg-neutral-800 dark:peer-focus:ring-blue-500" />
		</label>
	);
};
