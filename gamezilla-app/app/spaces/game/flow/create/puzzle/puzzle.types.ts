import { PuzzleBuilder } from "./builder";
import { PuzzleCreate } from "./create";
import { PuzzleDeleteForever } from "./delete-forever";
import { PuzzleEditName } from "./edit";
import { PuzzleList } from "./list";
import type { PuzzleSaveChanges } from "./save-changes";

//
//
//
//
//
//

export type ModelClient =
	//
	PuzzleCreate.ModelClient &
		PuzzleList.ModelClient &
		PuzzleSaveChanges.ModelClient &
		PuzzleEditName.ModelClient &
		PuzzleDeleteForever.ModelClient;

export const initClient: ModelClient = {
	...PuzzleBuilder.initClient,
	...PuzzleCreate.initClient,
	...PuzzleList.initClient,
	...PuzzleEditName.initClient,
	...PuzzleDeleteForever.initClient,
};

export type ModelServer = null;

export const initServer: ModelServer = null;

//
//
//
// Msg
//
//
//

export type MsgClient =
	| PuzzleBuilder.MsgClient
	| PuzzleCreate.MsgClient
	| PuzzleEditName.MsgClient
	| PuzzleDeleteForever.MsgClient
	| PuzzleList.MsgClient
	| PuzzleSaveChanges.MsgClient;

export type MsgServer =
	| PuzzleCreate.MsgServer
	| PuzzleSaveChanges.MsgServer
	| PuzzleDeleteForever.MsgServer
	| PuzzleList.MsgServer
	| PuzzleEditName.MsgServer;

export type MsgToServer =
	| PuzzleCreate.MsgToServer
	| PuzzleSaveChanges.MsgToServer
	| PuzzleDeleteForever.MsgToServer
	| PuzzleEditName.MsgToServer
	| PuzzleList.MsgToServer;

export type MsgToClient =
	| PuzzleCreate.MsgToClient
	| PuzzleSaveChanges.MsgToClient
	| PuzzleEditName.MsgToClient
	| PuzzleDeleteForever.MsgToClient
	| PuzzleList.MsgToClient;

//
//
//
//
//
//
//

export type MsgCore =
	| PuzzleBuilder.MsgCore
	| PuzzleList.MsgCore
	| PuzzleCreate.MsgCore
	| PuzzleEditName.MsgCore
	| PuzzleDeleteForever.MsgCore
	| PuzzleSaveChanges.MsgCore;

export type ModelCore = {
	puzzleBuilder: PuzzleBuilder.ModelCore | null;
};
