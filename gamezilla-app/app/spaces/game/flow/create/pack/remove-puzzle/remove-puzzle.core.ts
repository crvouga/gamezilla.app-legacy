import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@/space";
import type { UserId } from "gamezilla-app/app/@/data";
import {
	type Posix,
	RequestResponse,
	type Result,
} from "gamezilla-app/@/core";
import type { FlowPack } from "../../../@/flow-pack";
import type { FlowPuzzle } from "../../../@/flow-puzzle";
import type { FlowPuzzleId } from "../../../@/flow-puzzle/flow-puzzle-id";
import type { FlowPackId } from "../../../@/flow-pack/flow-pack-id";

//
//
//
//
//

export type RemovePuzzleClientCtx = SpaceClientCtx & {
	pack: FlowPack;
	puzzle: FlowPuzzle;
	packPuzzleIndex: number;
};

//
//
// Model
//
//

export type ModelClient = {
	packs: {
		[packId: FlowPackId]: FlowPack;
	};
	removePuzzleRequest: RequestResponse<string, null>;
};

export const initClient = (packs: ModelClient["packs"]): ModelClient => {
	return {
		packs,
		removePuzzleRequest: RequestResponse.notAsked,
	};
};

//
//
// Msg
//
//

export type MsgClient =
	| {
			t: "remove-puzzle.clicked-remove-from-pack-button";
	  }
	| {
			t: "remove-puzzle.time-passed";
	  };

export type MsgToServer = {
	t: "remove-puzzle.clicked-remove-from-pack-button";
};

export type ReqRes =
	| {
			t: "remove-puzzle-from-pack";
			req: {
				userId: UserId;
				puzzleId: FlowPuzzleId;
				packId: FlowPackId;
			};
			res: {
				result: Result<string, null>;
				puzzleId: FlowPuzzleId;
				packId: FlowPackId;
				packPuzzleIndex: number;
			};
	  }
	| {
			t: "remove-puzzle-from-pack";
			req: {
				userId: UserId;
				puzzleId: FlowPuzzleId;
				packId: FlowPackId;
			};
			res: {
				result: Result<string, null>;
				puzzleId: FlowPuzzleId;
				packId: FlowPackId;
				packPuzzleIndex: number;
			};
	  };

export type MsgToClient = {
	t: "remove-puzzle.removed";
	result: Result<string, null>;
	puzzleId: FlowPuzzleId;
	packId: FlowPackId;
	packPuzzleIndex: number;
};

//
//
// Sync
//
//

export type ModelSync = {
	removePuzzleRequest: RequestResponse<string, null>;
};

export type MsgSync =
	| {
			t: "remove-puzzle.user-clicked-remove-puzzle-button";
			userId: UserId;
			puzzleId: FlowPuzzleId;
	  }
	| {
			t: "remove-puzzle.user-removed-puzzle-from-pack";
			result: Result<string, null>;
			puzzleId: FlowPuzzleId;
			userId: UserId;
			now: Posix;
	  };

export const initSync: ModelSync = {
	removePuzzleRequest: RequestResponse.notAsked,
};

export const reducer = (modelSync: ModelSync, msgSync: MsgSync): ModelSync => {
	switch (msgSync.t) {
		case "remove-puzzle.user-removed-puzzle-from-pack": {
			return {
				...modelSync,
				removePuzzleRequest: RequestResponse.response(
					modelSync.removePuzzleRequest,
					msgSync.now,
					msgSync.result,
				),
			};
		}

		default: {
			return modelSync;
		}
	}
};
