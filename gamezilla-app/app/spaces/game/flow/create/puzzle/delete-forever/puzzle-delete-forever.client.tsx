import { RemoteResult, isLoading } from "gamezilla-app/@/core";
import {
	APP_SOUND,
	playSound,
	sendToServer,
	showCreatedSm,
} from "gamezilla-app/app/@/client";
import {
	ConfirmationDrawer,
	IconDeleteForever,
	ListItemButton,
} from "gamezilla-app/app/@/ui";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import type { ClientModule } from "../../create.core";

const update: ClientModule["update"] = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		(model) => updateFromMsg({ ...input, model }),
		(model) => updateFromMsgCore({ ...input, model }),
	);
};

const updateFromMsg: ClientModule["update"] = (input) => {
	const { msg, model } = input;

	switch (msg?.t) {
		case "delete-forever.user-clicked-delete-button": {
			return {
				model: { ...model, puzzleBuilderOpened: "delete-forever" },
				msgCmd: [playSound(APP_SOUND.alertErrorSm)],
			};
		}

		case "delete-forever.user-closed-drawer": {
			return { model: { ...model, puzzleBuilderOpened: null } };
		}

		case "delete-forever.user-clicked-cancel-button": {
			return { model: { ...model, puzzleBuilderOpened: "more" } };
		}

		case "delete-forever.user-clicked-confirm-button": {
			return {
				model: { ...model, puzzleDeleteForeverRequest: RemoteResult.loading },
				msgCmd: [
					sendToServer({ t: "delete-forever.user-confirmed" }),
					playSound(APP_SOUND.tap),
				],
			};
		}

		default: {
			return { model };
		}
	}
};

const updateFromMsgCore: ClientModule["update"] = (input) => {
	const { msgCore, model } = input;

	switch (msgCore?.t) {
		case "user-deleted-puzzle": {
			const puzzlesNew = { ...model.puzzles };
			delete puzzlesNew[msgCore.flowPuzzleId];
			return {
				model: {
					...model,
					puzzles: puzzlesNew,
					puzzleDeleteForeverRequest: msgCore.deleted,
					puzzleBuilderOpened: null,
				},
				msgCmd: showCreatedSm("Deleted puzzle"),
			};
		}

		default: {
			return { model };
		}
	}
};

const View: ClientModule["View"] = (input) => {
	const { model, dispatch } = input;
	return (
		<>
			<ListItemButton
				icon={(props) => <IconDeleteForever {...props} />}
				label="Delete Forever"
				color="danger"
				onClick={() =>
					dispatch({ t: "delete-forever.user-clicked-delete-button" })
				}
			/>

			<ConfirmationDrawer
				id="delete-forever-drawer"
				open={
					input.model.puzzleBuilderOpened === "delete-forever" ||
					isLoading(model.puzzleDeleteForeverRequest)
				}
				onClose={() => dispatch({ t: "delete-forever.user-closed-drawer" })}
				variant="danger"
				position="bottom"
				title="Delete puzzle forever?"
				body="This action cannot be undone."
				//
				confirmLoading={isLoading(model.puzzleDeleteForeverRequest)}
				confirmText="Delete"
				onConfirm={() =>
					dispatch({
						t: "delete-forever.user-clicked-confirm-button",
					})
				}
				//
				cancelDisabled={isLoading(model.puzzleDeleteForeverRequest)}
				onCancel={() =>
					dispatch({ t: "delete-forever.user-clicked-cancel-button" })
				}
			/>
		</>
	);
};

export const PuzzleDeleteForeverClient: Pick<ClientModule, "update" | "View"> =
	{
		update,
		View,
	};
