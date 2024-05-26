import { p } from "gamezilla-app/@/core/parser";
import { FlowVariant, FlowVariantUIPlay } from "../@/flow";
import { FlowPack, FlowPackList } from "../@/flow-pack";
import { FlowPackId } from "../@/flow-pack/flow-pack-id";
import { FlowPuzzle } from "../@/flow-puzzle";
import { FlowPuzzleId } from "../@/flow-puzzle/flow-puzzle-id";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { FlowClientCtx } from "../@/flow-ctx";
import { SpaceClientCmd } from "gamezilla-app/app/spaces/@/space-client-cmd";
import { SpaceClientEvent, SpaceCtx } from "gamezilla-app/app/spaces/@/space";
import { FlowPackGrid } from "../@/flow-pack/flow-pack-grid";
import { ScreenPuzzleTypes } from "./screen-puzzle";
import { GameCoreModule } from "gamezilla-app/app/spaces/@/architecture/game-sync";

//
//
//
//
//
//

export type ModelClient = {
	flow: FlowVariant.Model;
	flowUIPlay: FlowVariantUIPlay.Model;
	flowPuzzles: { [flowPuzzleId: FlowPuzzleId]: FlowPuzzle };
	flowPacks: { [flowPackId: FlowPackId]: FlowPack };
	flowPackGrid: FlowPackGrid.ModelClient;
	flowPackList: FlowPackList.ModelClient;
};

export const ModelServer = p.obj({});
export type ModelServer = p.Infer<typeof ModelServer>;

//
//
//
//
//
//

export type MsgClient =
	| MsgCore
	| {
			t: "flow-pack-list";
			c: FlowPackList.MsgClient;
	  }
	| {
			t: "flow-pack-grid";
			c: FlowPackGrid.MsgClient;
	  };

export type MsgServer =
	| {
			t: "flow-pack-list";
			c: FlowPackList.MsgServer;
	  }
	| {
			t: "flow-pack-grid";
			c: FlowPackGrid.MsgServer;
	  };

export type MsgToServer =
	| {
			t: "flow-pack-list";
			c: FlowPackList.MsgToServer;
	  }
	| {
			t: "flow-pack-grid";
			c: FlowPackGrid.MsgToServer;
	  };

export type MsgToClient =
	| {
			t: "flow-pack-list";
			c: FlowPackList.MsgToClient;
	  }
	| {
			t: "flow-pack-grid";
			c: FlowPackGrid.MsgToClient;
	  };

export const MsgCore = p.or(
	p.obj({
		t: p.l("flow-play-ui"),
		c: FlowVariantUIPlay.Msg,
	}),
	p.obj({
		t: p.l("got-puzzle-screen-flow-play-msg"),
		c: FlowVariantUIPlay.Msg,
	}),
	p.obj({
		t: p.l("user-clicked-open-pack-list-item"),
		pack: FlowPack,
	}),
	p.obj({
		t: p.l("user-clicked-exit-pack-button"),
	}),
	p.obj({
		t: p.l("user-clicked-open-puzzle-grid-item"),
		flowPuzzle: FlowPuzzle,
		puzzleIndex: p.num,
	}),
	ScreenPuzzleTypes.MsgCore,
);

export type MsgCore = p.Infer<typeof MsgCore>;

const Screen = p.or(
	p.obj({
		t: p.l("screen-select-pack"),
	}),
	p.obj({
		t: p.l("screen-pack"),
		flowPack: FlowPack,
	}),
	ScreenPuzzleTypes.ModelCore,
);

export const ModelCore = p.obj({
	play: FlowVariantUIPlay.Model,
	flow: FlowVariant.Model,
	screen: Screen,
});
export type ModelCore = p.Infer<typeof ModelCore>;

//
//
//
//
//
//

export type ClientModule = GameClientModule<{
	Model: ModelClient;
	Msg: MsgClient;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	MsgCore: MsgCore;
	ModelCore: ModelCore;
	Ctx: FlowClientCtx;
	MsgCmdOut: SpaceClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>;
	MsgEvtIn: SpaceClientEvent;
}>;

export type CoreModule = GameCoreModule<{
	Ctx: SpaceCtx;
	ModelCore: ModelCore;
	MsgCore: MsgCore;
}>;
