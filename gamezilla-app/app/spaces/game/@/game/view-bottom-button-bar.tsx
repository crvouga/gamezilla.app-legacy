import {
	IconArrowLeftOnRect,
	IconArrowRotateLeft,
	IconChevronLeft,
	IconChevronRight,
	Spinner,
	cn,
} from "gamezilla-app/app/@/ui";
import type { VDom, VDomChildren } from "gamezilla-app/@/vdom";
import type { Translator } from "gamezilla-app/@/l18n/generated";

type BottomBarButtonAction = {
	label: string;
	disabled?: boolean;
	icon: (props: { className: string }) => VDom;
	classNames?: {
		button?: string;
		label?: string;
	};
	onClick: () => void;
	loading?: boolean;
	color?: "danger" | "success" | "inherit";
};

export const ViewBottomButtonBar = ({
	children,
}: {
	children: VDomChildren;
}) => {
	return (
		<div className="flex w-full items-center border-t border-neutral-700">
			{children}
		</div>
	);
};

export const ViewBottomButtonBarAction = (props: BottomBarButtonAction) => {
	const isDisabled = props.disabled || props.loading;
	return (
		<button
			type="button"
			role="button"
			disabled={isDisabled}
			key={props.label}
			name={props.label}
			aria-disabled={isDisabled}
			aria-label={props.label}
			onClick={props.onClick}
			className={cn(
				"relative flex flex-1 flex-col items-center gap-0.5 p-2 text-sm transition-opacity",
				!isDisabled && "active:opacity-50",
				props.disabled && "cursor-not-allowed opacity-50",
				props.color === "danger" && "text-red-500",
				props.color === "success" && "text-green-500",
				props.classNames?.button,
			)}
		>
			<div
				className={cn(
					"flex h-full w-full flex-col items-center justify-center gap-0.5 transition-opacity",
					props.loading ? "opacity-0" : "opacity-100",
				)}
			>
				{props.icon({ className: "h-7 w-7" })}
				<p className={cn("text-xs", props.classNames?.label)}>{props.label}</p>
			</div>

			<div
				className={cn(
					"absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
					props.loading ? "opacity-100" : "opacity-0",
				)}
			>
				<Spinner className="h-8 w-8" />
			</div>
		</button>
	);
};

type BottomBarButtonActionPrebuilt = {
	onClick: () => void;
	ctx: {
		t: Translator;
	};
	disabled?: boolean;
};

export const ViewBottomButtonBarActionExit = (
	props: BottomBarButtonActionPrebuilt,
) => {
	return (
		<ViewBottomButtonBarAction
			{...props}
			icon={(props) => <IconArrowLeftOnRect {...props} />}
			label={props.ctx.t("app.exit")}
		/>
	);
};

export const ViewBottomButtonBarActionNext = (
	props: BottomBarButtonActionPrebuilt,
) => {
	return (
		<ViewBottomButtonBarAction
			{...props}
			icon={(props) => <IconChevronRight {...props} />}
			label={props.ctx.t("app.next")}
		/>
	);
};

export const ViewBottomButtonBarActionReset = (
	props: BottomBarButtonActionPrebuilt,
) => {
	return (
		<ViewBottomButtonBarAction
			{...props}
			icon={(props) => <IconArrowRotateLeft {...props} />}
			label={props.ctx.t("app.reset")}
		/>
	);
};
export const ViewBottomButtonBarActionPrev = (
	props: BottomBarButtonActionPrebuilt,
) => {
	return (
		<ViewBottomButtonBarAction
			{...props}
			icon={(props) => <IconChevronLeft {...props} />}
			label={props.ctx.t("app.prev")}
		/>
	);
};
