import { type RemoteResult, Result, NotAsked } from "gamezilla-app/@/core";
import { FlowPuzzleId } from "../../../@/flow-puzzle/flow-puzzle-id";
import { UserId } from "gamezilla-app/app/@/data";
import { p } from "gamezilla-app/@/core/parser";

//
//
//
//

export type ModelClient = {
	puzzleEditNameRequest: RemoteResult<string, null>;
	puzzleEditNameDraft: string;
	puzzleEditNameValidationError: EditNameValidationError;
};

export const initClient: ModelClient = {
	puzzleEditNameDraft: "",
	puzzleEditNameRequest: NotAsked,
	puzzleEditNameValidationError: null,
};

export type EditNameValidationError = "name-cannot-be-empty" | null;

export const editNameValidationErrorToString = (
	error?: EditNameValidationError,
) => {
	switch (error) {
		case "name-cannot-be-empty": {
			return "Name cannot be empty";
		}
		default: {
			return null;
		}
	}
};

export type ModelServer = {};

//
//
//
//

export type MsgClient =
	| { t: "puzzle.edit-name.user-inputted-draft-name"; draftName: string }
	| { t: "puzzle.edit-name.user-closed-drawer" }
	| { t: "puzzle.edit-name.user-clicked-button" }
	| { t: "puzzle.edit-name.user-clicked-save-button" }
	| { t: "puzzle.edit-name.user-clicked-cancel-button" };

export type MsgServer = { t: "noop" };

export type MsgToServer = {
	t: "puzzle.edit-name.user-clicked-save-button";
	newName: string;
	flowPuzzleId: FlowPuzzleId;
};

export type MsgToClient = {
	t: "noop";
};

//
//
//
//
//

export const MsgCore = p.obj({
	t: p.l("user-edited-puzzle-name"),
	edited: Result.parser(p.str, p.l(null)),
	flowPuzzleId: FlowPuzzleId,
	newName: p.str,
	userId: UserId,
});
export type MsgCore = p.Infer<typeof MsgCore>;
