import { VDomChildren } from "gamezilla-app/@/vdom";
import { cn } from "./ui";

export const Dialog = (props: {
	children: VDomChildren;
	open: boolean;
	onClose: () => void;
}) => {
	return (
		<div
			role="dialog"
			className={cn(
				"absolute left-0 top-0 grid h-full w-full place-items-center transition-all duration-300 ease-in-out",
				props.open
					? "opacity-100 scale-100"
					: "opacity-0 scale-0 pointer-events-none",
			)}
			onClick={(e) => {
				if (e.target !== e.currentTarget) {
					return;
				}
				props.onClose();
			}}
		>
			{props.children}
		</div>
	);
};

export const DialogSurface = (props: { children: VDomChildren }) => {
	return (
		<div className="flex w-80 flex-col gap-6 rounded-lg bg-neutral-950 p-6">
			{props.children}
		</div>
	);
};

export const DialogHeader = (props: { title: string }) => {
	return (
		<p
			role="heading"
			title={props.title}
			className="text-center text-xl font-semibold"
		>
			{props.title}
		</p>
	);
};
