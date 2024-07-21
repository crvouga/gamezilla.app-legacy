import type { VDom } from "gamezilla-app/@/vdom";
import { cn } from "./ui";

export const IconButton = (input: {
	onClick?: () => void;
	label: string;
	renderIcon: (input: { className: string }) => VDom;
	className?: string;
}) => {
	return (
		<button
			className={cn(
				"rounded-full w-12 h-12 display flex items-center justify-center overflow-hidden",
				input.className,
			)}
			onClick={input.onClick}
			aria-label={input.label}
		>
			{input.renderIcon({ className: "w-7 h-7" })}
		</button>
	);
};

export const IconButtonEmpty = () => {
	return <div className="w-12 h-12"></div>;
};
