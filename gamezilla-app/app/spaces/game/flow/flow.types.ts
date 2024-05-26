import { p } from "gamezilla-app/@/core/parser";
import { UserId } from "gamezilla-app/app/@/data";
import type { GameMainMenu } from "../@/game";
import type { FlowPack } from "./@/flow-pack";
import type { FlowPackId } from "./@/flow-pack/flow-pack-id";
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
	flowPuzzles: {
		[flowPuzzleId: FlowPuzzleId]: FlowPuzzle;
	};
	flowPacks: {
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

const MODE = ["builder", "play"] as const;
export const Mode = p.enumeration(MODE);
export type Mode = p.Infer<typeof Mode>;

//
//
//
//
//
//
//

export const MsgCore = p.or(
	p.obj({
		t: p.l("user-changed-mode"),
		mode: p.or(Mode, p.l(null)),
		userId: UserId,
	}),
	p.obj({
		t: p.l("play"),
		c: Play.MsgCore,
	}),
	p.obj({
		t: p.l("builder"),
		c: BuilderTypes.MsgCore,
	}),
);
export type MsgCore = p.Infer<typeof MsgCore>;

export const ModelCore = p.or(
	p.obj({ t: p.l(null) }),
	p.obj({ t: p.l("builder"), c: BuilderTypes.ModelCore }),
	p.obj({ t: p.l("play"), c: Play.ModelCore }),
);
export type ModelCore = p.Infer<typeof ModelCore>;
