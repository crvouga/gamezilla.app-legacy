import type { VDomChildren } from "gamezilla-app/@/vdom";
import { IconExclamationCircle, IconInfoCircle } from "./icon";
import { IconCheckmarkCircle } from "./icon/icon-checkmark-circle";
import { cn } from "./ui";

export const AlertError = ({
	className,
	text,
}: {
	text?: string;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				"flex w-full items-center rounded-md bg-red-500 p-4 text-white",
				className,
			)}
		>
			<div className="mr-2">
				<IconExclamationCircle className="h-6 w-6" />
			</div>

			{text}
		</div>
	);
};

export const AlertInfo = ({
	children,
	className,
}: {
	children?: VDomChildren;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				className,
				"flex w-full items-center rounded-md bg-blue-500 p-4 text-white",
			)}
		>
			<div className="mr-2">
				<IconInfoCircle className="h-6 w-6" />
			</div>
			{children}
		</div>
	);
};

export const AlertSuccess = ({
	children,
	className,
}: {
	children?: VDomChildren;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				className,
				"flex w-full items-center rounded-md bg-green-500 p-4 text-white",
			)}
		>
			<div className="mr-2">
				<IconCheckmarkCircle className="h-6 w-6" />
			</div>
			{children}
		</div>
	);
};
