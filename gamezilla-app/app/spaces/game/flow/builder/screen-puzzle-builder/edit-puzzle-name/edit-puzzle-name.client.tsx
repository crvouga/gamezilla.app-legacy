import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import {
	APP_SOUND,
	playSound,
	sendToServer,
	showErrSm,
	showCreatedSm,
} from "gamezilla-app/app/@/client";
import {
	Button,
	Drawer,
	IconPenToSquare,
	ListItemButton,
	TextField,
} from "gamezilla-app/app/@/ui";
import { isLoading, isOk, Loading } from "gamezilla-app/@/core";
import { FlowPuzzleName } from "../../../@/flow-puzzle/flow-puzzle-name";
import type { ClientModule } from "../../builder.types";
import { editNameValidationErrorToString } from "./edit-puzzle-name.types";
import type { VDomChildren } from "gamezilla-app/@/vdom";

//
//
//
//
//
//

const update: ClientModule["update"] = (input) => {
	const { model } = input;
	return GameClientModule.andThen(
		{ model },
		(model) => updateDraftNameInput({ ...input, model }),
		(model) => updateDrawer({ ...input, model }),
		(model) => updateFormButtons({ ...input, model }),
	);
};

const View: ClientModule["View"] = (input) => {
	return (
		<ViewDrawer {...input}>
			<p className="px-4 pt-4 text-2xl font-bold">Edit name</p>
			<ViewDraftNameInput {...input} />
			<ViewFormButtons {...input} />
		</ViewDrawer>
	);
};

//
//
//
//
//

const updateFormButtons: ClientModule["update"] = (input) => {
	const { modelCore, msgCore, msg, model } = input;

	const puzzleBuilder = modelCore.puzzleBuilder;

	if (!puzzleBuilder) {
		return { model };
	}

	switch (msg?.t) {
		case "puzzle.edit-name.user-clicked-cancel-button": {
			return {
				model: {
					...model,
					puzzleBuilderOpened: "more",
					puzzleEditNameValidationError: null,
				},
			};
		}

		case "puzzle.edit-name.user-clicked-save-button": {
			const newName = model.puzzleEditNameDraft ?? "";

			if (newName.length === 0) {
				return {
					model: {
						...model,
						puzzleEditNameValidationError: "name-cannot-be-empty",
					},
					msgCmd: [playSound(APP_SOUND.alertErrorSm)],
				};
			}

			return {
				model: {
					...model,
					puzzleEditNameRequest: Loading,
					puzzleEditNameValidationError: null,
				},
				msgCmd: [
					playSound(APP_SOUND.tap),
					sendToServer({
						t: "puzzle.edit-name.user-clicked-save-button",
						newName,
						flowPuzzleId: puzzleBuilder.puzzle.id,
					}),
				],
			};
		}

		default: {
			break;
		}
	}

	switch (msgCore?.t) {
		case "user-edited-puzzle-name": {
			const puzzlesNew = { ...model.puzzles };
			const puzzle = puzzlesNew[msgCore.flowPuzzleId];

			if (puzzle && FlowPuzzleName.is(msgCore.newName)) {
				puzzlesNew[msgCore.flowPuzzleId] = {
					...puzzle,
					name: msgCore.newName,
				};
			}

			return {
				model: {
					...model,
					puzzles: puzzlesNew,
					puzzleEditNameRequest: msgCore.edited,
					puzzleBuilderOpened: null,
				},
				msgCmd: isOk(msgCore.edited)
					? showCreatedSm(input.ctx.t("flow.saved-name"))
					: showErrSm(input.ctx.t("app.something-went-wrong")),
			};
		}

		default: {
			break;
		}
	}

	return { model };
};

const ViewFormButtons: ClientModule["View"] = (input) => {
	return (
		<div className="flex w-full items-center gap-4 p-4 pb-6">
			<Button
				className="flex-1"
				text={input.ctx.t("app.cancel")}
				onClick={() =>
					input.dispatch({
						t: "puzzle.edit-name.user-clicked-cancel-button",
					})
				}
			/>
			<Button
				className="flex-1"
				color="primary"
				variant="contained"
				text={input.ctx.t("app.save")}
				loading={isLoading(input.model.puzzleEditNameRequest)}
				disabled={
					input.modelCore.opened.t !== "puzzle-builder" ||
					input.model.puzzleEditNameDraft ===
						input.modelCore.puzzleBuilder?.puzzle.name
				}
				onClick={() =>
					input.dispatch({ t: "puzzle.edit-name.user-clicked-save-button" })
				}
			/>
		</div>
	);
};

//
//
//
//
//

const updateDrawer: ClientModule["update"] = (input) => {
	const { msg, model, modelCore } = input;

	switch (msg?.t) {
		case "puzzle.edit-name.user-clicked-button": {
			return {
				model: {
					...model,
					puzzleBuilderOpened: "edit-name",
					puzzleEditNameDraft: modelCore.puzzleBuilder?.puzzle.name ?? "",
				},
			};
		}

		case "puzzle.edit-name.user-closed-drawer": {
			return { model: { ...model, puzzleBuilderOpened: null } };
		}

		default: {
			return { model };
		}
	}
};

const ViewDrawer = (
	input: Parameters<ClientModule["View"]>[0] & { children: VDomChildren },
) => {
	const { children, dispatch, model } = input;
	return (
		<>
			<ListItemButton
				icon={(input) => <IconPenToSquare {...input} />}
				label="Edit Name"
				onClick={() => dispatch({ t: "puzzle.edit-name.user-clicked-button" })}
			/>

			<Drawer
				id="edit-name-drawer"
				open={model.puzzleBuilderOpened === "edit-name"}
				onClose={() => dispatch({ t: "puzzle.edit-name.user-closed-drawer" })}
				position="bottom"
			>
				{children}
			</Drawer>
		</>
	);
};

//
//
//
//
//
//

const updateDraftNameInput: ClientModule["update"] = ({ model, msg }) => {
	switch (msg?.t) {
		case "puzzle.edit-name.user-inputted-draft-name": {
			return {
				model: {
					...model,
					puzzleEditNameDraft: msg.draftName,
					puzzleEditNameValidationError: null,
				},
			};
		}
		default: {
			return { model };
		}
	}
};

const ViewDraftNameInput: ClientModule["View"] = (input) => {
	return (
		<div className="w-full p-4">
			<TextField
				id="edit-name-input"
				label="Name"
				value={input.model.puzzleEditNameDraft}
				onChange={(draftName) =>
					input.dispatch({
						t: "puzzle.edit-name.user-inputted-draft-name",
						draftName,
					})
				}
				error={Boolean(input.model.puzzleEditNameValidationError)}
				helperText={editNameValidationErrorToString(
					input.model.puzzleEditNameValidationError,
				)}
			/>
		</div>
	);
};

//
//
//
//
//
//

export const EditPuzzleNameClient = {
	update,
	View,
};
