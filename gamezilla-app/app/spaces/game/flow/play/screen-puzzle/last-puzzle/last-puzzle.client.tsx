import { TimeSpan } from "gamezilla-app/@/core";
import type { ClientCtx } from "gamezilla-app/app/@/client";
import {
	Button,
	Dialog,
	DialogHeader,
	DialogSurface,
} from "gamezilla-app/app/@/ui";
import { withId } from "gamezilla-app/app/spaces/@/event";
import type { ClientModule, MsgClient } from "../../play.types";

const update: ClientModule["update"] = (input) => {
	switch (input.msg?.t) {
		case "user-closed-puzzle-complete-dialog":
		case "user-clicked-select-next-pack-button": {
			return {
				model: input.model,
				msgCore: [withId(input.msg)],
			};
		}
	}
	switch (input.msgCore?.t) {
		case "user-closed-puzzle-complete-dialog": {
			return {
				model: input.model,
			};
		}
	}
	return {
		model: input.model,
	};
};

const View = (input: {
	open: boolean;
	delay: TimeSpan;
	dispatch: (m: MsgClient) => void;
	ctx: ClientCtx;
}) => {
	return (
		<Dialog
			delay={TimeSpan.seconds(1)}
			open={input.open}
			onClose={() =>
				input.dispatch({ t: "user-closed-puzzle-complete-dialog" })
			}
		>
			<DialogSurface>
				<DialogHeader title={input.ctx.t("app.congratulations")} />

				<Button
					text={input.ctx.t("flow.select-next-pack")}
					onClick={() =>
						input.dispatch({
							t: "user-clicked-select-next-pack-button",
						})
					}
				/>
			</DialogSurface>
		</Dialog>
	);
};

export const LastPuzzleClient = {
	View,
	update,
};
