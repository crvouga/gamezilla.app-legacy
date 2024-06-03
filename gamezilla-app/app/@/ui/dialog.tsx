import type { VDomChildren } from "gamezilla-app/@/vdom";
import { cn } from "./ui";
import { TimeSpan } from "gamezilla-app/@/core";

export const Dialog = (props: {
	children: VDomChildren;
	open: boolean;
	onClose: () => void;
	delay?: TimeSpan;
}) => {
	const delayMs = props.delay ? TimeSpan.toMilliseconds(props.delay) : null;
	return (
		<div
			role="dialog"
			style={{
				"transition-delay": props.open && delayMs ? `${delayMs}ms` : undefined,
			}}
			className={cn(
				"absolute left-0 top-0 grid h-full w-full place-items-center transition-all duration-300 ease-in-out",
				props.open
					? `scale-100 opacity-100`
					: "pointer-events-none scale-0 opacity-0",
			)}
			onClick={(e) => {
				if (e.target !== e.currentTarget) {
					return;
				}
				props.onClose();
			}}
			onKeyDown={(e) => {
				switch (e.key) {
					case "Escape": {
						props.onClose();
						return;
					}
					default: {
						return;
					}
				}
			}}
		>
			{props.children}
		</div>
	);
};

export const DialogSurface = (props: { children: VDomChildren }) => {
	return (
		<div className="flex w-80 flex-col gap-6 rounded-lg bg-neutral-900 p-6">
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
