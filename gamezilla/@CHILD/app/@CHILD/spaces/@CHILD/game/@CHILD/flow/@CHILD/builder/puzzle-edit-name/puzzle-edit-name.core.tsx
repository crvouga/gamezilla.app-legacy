import { RemoteResult, Result } from "gamezilla/@SHARED/core";
import { FlowPuzzleId } from "../../../@SHARED/flow-puzzle/flow-puzzle-id";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";

//
//
//
//

export type ClientModel = {
  editNameRequest?: RemoteResult<string, null>;
  editNameDraft?: string;
  editNameValidationError?: EditNameValidationError;
};

export type EditNameValidationError = "name-cannot-be-empty" | null;

export const editNameValidationErrorToString = (
  error?: EditNameValidationError
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

export type ServerModel = {};

//
//
//
//

export type ClientMsg =
  | { t: "puzzle.edit-name.user-inputted-draft-name"; draftName: string }
  | { t: "puzzle.edit-name.user-closed-drawer" }
  | { t: "puzzle.edit-name.user-clicked-button" }
  | { t: "puzzle.edit-name.user-clicked-save-button" }
  | { t: "puzzle.edit-name.user-clicked-cancel-button" };

export type ServerMsg = { t: "noop" };

export type ToServer = {
  t: "puzzle.edit-name.user-clicked-save-button";
  newName: string;
  flowPuzzleId: FlowPuzzleId;
};

export type ToClient = {
  t: "noop";
};

//
//
//
//
//

export type GameEvent = {
  t: "user-edited-puzzle-name";
  edited: Result<string, null>;
  flowPuzzleId: FlowPuzzleId;
  newName: string;
  userId: UserId;
};
