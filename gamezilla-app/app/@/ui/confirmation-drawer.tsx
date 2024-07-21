import { TranslatedText } from "gamezilla-app/@/l18n";
import { Button } from "./button";
import { Drawer, type Drawerinput } from "./drawer";
import { Typography } from "./typography";

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
			<Typography
				variant="title"
				className="w-full px-4 pt-4 text-left"
				text={input.title}
			/>

			<Typography className="p-4" variant="body" text={input.body} />

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
