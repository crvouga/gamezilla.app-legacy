import { withId } from "gamezilla-app/app/spaces/@/event";
import {
	APP_SOUND,
	playSound,
	sendToServer,
	showToast,
} from "gamezilla-app/app/@/client";
import { Button, IconPlus } from "gamezilla-app/app/@/ui";
import { Ok, loading } from "gamezilla-app/@/core";
import type { ClientModule } from "../../create.core";

const update: ClientModule["update"] = (input) => {
	const { model, msg, msgCore, msgServer } = input;

	switch (msg?.t) {
		case "pack-create.clicked-create-button": {
			return {
				model: {
					...model,
					packCreateRequest: loading,
				},
				msgCmd: [
					playSound(APP_SOUND.tap),
					sendToServer({
						t: "pack-create.clicked-create-button",
					}),
				],
			};
		}
	}

	switch (msgServer?.t) {
		case "pack-create.created-pack": {
			return {
				model,
				msgCore: [
					withId({
						t: "user-created-pack",
						created: msgServer.created,
						userId: input.ctx.currentUserId,
					}),
				],
			};
		}
	}

	switch (msgCore?.t) {
		case "user-created-pack": {
			return {
				model: {
					...model,
					packCreateRequest: Ok(null),
				},
				msgCmd: [playSound(APP_SOUND.refreshFeed), showToast("Pack created")],
			};
		}
	}

	return { model };
};

const ViewCreateButton: ClientModule["View"] = (input) => {
	const { dispatch, model } = input;

	return (
		<Button
			text="Create Pack"
			variant="contained"
			color="primary"
			loading={model.packCreateRequest.t === "loading"}
			start={<IconPlus className="h-8 w-8" />}
			onClick={() => dispatch({ t: "pack-create.clicked-create-button" })}
		/>
	);
};

export const PackCreateClient = {
	update,
	ViewCreateButton,
};
