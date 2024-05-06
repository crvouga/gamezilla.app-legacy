import { p } from "gamezilla-app/@/core/parser";
import type { UserId } from "gamezilla-app/app/@/data";
import type { GameMainMenu } from "../@/game";
import { FlowPack } from "./@/flow-pack";
import { FlowPackId } from "./@/flow-pack/flow-pack-id";
import type { FlowPuzzle } from "./@/flow-puzzle/flow-puzzle";
import type { FlowPuzzleId } from "./@/flow-puzzle/flow-puzzle-id";
import { BuilderTypes } from "./builder";
import * as Play from "./play/play.types";

//
//
// Model
//
//

export type BaseModelClient = {
	puzzles: {
		[flowPuzzleId: FlowPuzzleId]: FlowPuzzle;
	};
	packs: {
		[flowPackId: FlowPackId]: FlowPack;
	};
};

export type VariantModelClient =
	| { t: "none" }
	| { t: "builder"; c: BuilderTypes.ModelClient }
	| { t: "play"; c: Play.ModelClient };

export type ModelClient = BaseModelClient & VariantModelClient;

export const ModelServer = p.or(
	p.obj({
		t: p.l("none"),
	}),
	p.obj({
		t: p.l("builder"),
		c: BuilderTypes.ModelServer,
	}),
	p.obj({
		t: p.l("play"),
		c: Play.ModelServer,
	}),
);

export type ModelServer = p.Infer<typeof ModelServer>;

//
//
// Msg
//
//

export type MsgClient =
	| GameMainMenu.Msg
	| { t: "msgCore"; c: MsgCore }
	| { t: "builder"; c: BuilderTypes.MsgClient }
	| { t: "play"; c: Play.MsgClient };

export type MsgServer =
	| { t: "builder"; c: BuilderTypes.MsgServer }
	| { t: "play"; c: Play.MsgServer };

export type MsgToServer =
	| { t: "builder"; c: BuilderTypes.MsgToServer }
	| { t: "play"; c: Play.MsgToServer };

export type MsgToClient =
	| { t: "builder"; c: BuilderTypes.MsgToClient }
	| { t: "play"; c: Play.MsgToClient };

export type Mode = "builder" | "play";

//
//
//
//
//
//
//

export type MsgCore =
	| { t: "user-changed-mode"; mode: Mode | null; userId: UserId }
	| { t: "play"; c: Play.MsgCore }
	| { t: "builder"; c: BuilderTypes.MsgCore };

export type ModelCore =
	| { t: null }
	| { t: "builder"; c: BuilderTypes.ModelCore }
	| { t: "play"; c: Play.ModelCore };
