import { TranslatedText } from "gamezilla-app/@/l18n";
import { Button } from "./button";
import { Drawer, type Drawerinput } from "./drawer";
import { cn } from "./ui";

type input = Drawerinput & {
	title: TranslatedText;
	body: TranslatedText;
	variant?: "danger";
	//
	cancelText: TranslatedText;
	cancelDisabled?: boolean;
	onCancel: () => void;
	//
	confirmText: TranslatedText;
	onConfirm: () => void;
	confirmLoading?: boolean;
};

export const ConfirmationDrawer = (input: input) => {
	return (
		<Drawer {...input}>
			<p
				className={cn(
					"w-full px-4 pt-4 text-left text-3xl font-bold",
					//   input.variant === "danger" && "text-red-500"
				)}
			>
				{input.title}
			</p>
			<p className="w-full p-4 text-left text-lg text-neutral-300">
				{input.body}
			</p>
			<div className="flex w-full items-center gap-4 p-4">
				<Button
					className="flex-1"
					onClick={input.onCancel}
					text={input.cancelText ?? "Cancel"}
					disabled={input.cancelDisabled}
				/>
				<Button
					className="flex-1"
					color={input.variant === "danger" ? "danger" : "default"}
					onClick={input.onConfirm}
					variant="contained"
					text={input.confirmText}
					loading={input.confirmLoading}
				/>
			</div>
		</Drawer>
	);
};
