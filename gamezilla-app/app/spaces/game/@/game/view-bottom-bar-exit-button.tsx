import { ClientCtx } from "gamezilla-app/app/@/client";
import { Button, IconArrowLeftOnRect } from "gamezilla-app/app/@/ui";

export const ViewBottomBarExitButton = (input: {
	onClick: () => void;
	ctx: ClientCtx;
}) => {
	return (
		<div className="flex w-full items-center gap-4 border-t border-neutral-700 p-4">
			<Button
				onClick={input.onClick}
				className="flex-1"
				text={input.ctx.t("app.exit")}
				start={<IconArrowLeftOnRect className="h-6 w-6" />}
				variant="contained"
				color="default"
			/>
		</div>
	);
};
