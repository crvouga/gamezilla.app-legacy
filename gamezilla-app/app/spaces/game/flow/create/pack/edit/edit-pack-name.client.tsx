import { ClientCtx, showErrSm } from "gamezilla-app/app/@/client";
import {
	Button,
	Drawer,
	DrawerHeader,
	TextField,
} from "gamezilla-app/app/@/ui";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { ModelCore, MsgClient, MsgCore } from "./edit-pack-name.types";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { isErr } from "gamezilla-app/@/core";

type ClientModule = GameClientModule<{
	Ctx: ClientCtx & { open: boolean };
	ModelCore: ModelCore;
	MsgCore: MsgCore;
	Msg: MsgClient;
	ViewEmit: {
		"clicked-cancel": void;
		closed: void;
	};
}>;

export const EditPackNameClient: Pick<ClientModule, "update" | "View"> = {
	update(input) {
		switch (input.msg?.t) {
			case "edit-pack-name.user-clicked-save-button":
			case "edit-pack-name.user-inputted-draft-name": {
				return { model: input.model, msgCore: [withId(input.msg)] };
			}
		}

		switch (input.msgCore?.t) {
			case "edit-pack-name.server-persisted-pack": {
				if (isErr(input.msgCore.result)) {
					return {
						model: input.model,
						msgCmd: showErrSm(
							input.ctx.t("app.something-went-wrong"),
							input.msgCore.result.error,
						),
					};
				}
				return { model: input.model };
			}
		}

		return { model: input.model };
	},
	View(input) {
		return (
			<Drawer
				id="edit-pack-name"
				open={input.ctx.open}
				onClose={() => input.emits?.closed()}
				position="bottom"
			>
				<DrawerHeader onClose={() => input.emits?.closed()} />
				<TextField
					id="pack-name"
					label="Pack Name"
					value={input.modelCore.editPackNameDraft}
					onChange={(packNameDraft) =>
						input.dispatch({
							t: "edit-pack-name.user-inputted-draft-name",
							packNameDraft,
							userId: input.ctx.currentUserId,
						})
					}
				/>
				<div>
					<Button text="Cancel" />
					<Button text="Save" />
				</div>
			</Drawer>
		);
	},
};
