import { Result } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { UserId } from "gamezilla-app/app/@/data";
import { FlowVariantUIPlay } from "../../../@/flow";
import { FlowPack } from "../../../@/flow-pack/flow-pack";
import { FlowPackGrid } from "../../../@/flow-pack/flow-pack-puzzles-grid";
import { FlowPuzzle } from "../../../@/flow-puzzle/flow-puzzle";
import { EditPackNameTypes } from "./edit-pack-name";

//
//
//
//
//

export type ModelClient = {
	packBuilder: {
		flowPackPuzzleGrid: FlowPackGrid.ModelClient;
	};
};

export const initClient: ModelClient = {
	packBuilder: {
		flowPackPuzzleGrid: FlowPackGrid.initClient,
	},
};

export type ModelServer = null;

export const initServer: ModelServer = null;

//
//
//
//

export type MsgClient =
	| MsgCore
	| {
			t: "pack-builder.flow-pack-grid";
			c: FlowPackGrid.MsgClient;
	  };

export type MsgServer = {
	t: "pack-builder.flow-pack-grid";
	c: FlowPackGrid.MsgServer;
};

export type MsgToServer = {
	t: "pack-builder.flow-pack-grid";
	c: FlowPackGrid.MsgToServer;
};

export type MsgToClient = {
	t: "pack-builder.flow-pack-grid";
	c: FlowPackGrid.MsgToClient;
};

//
//
//
//
//

export const Screen = p.or(
	p.obj({
		t: p.l("screen-add-puzzle"),
	}),
	p.obj({
		t: p.l("screen-puzzle-grid"),
	}),
	p.obj({
		t: p.l("screen-puzzle"),
		puzzleIndex: p.num,
		puzzle: FlowPuzzle,
		playUI: FlowVariantUIPlay.Model,
		opened: p.maybe(p.l("more")),
	}),
);

type Screen = p.Infer<typeof Screen>;

export const ModelCore = p.obj({
	pack: FlowPack,
	screen: Screen,
	slideIndex: p.num,
	editPackName: EditPackNameTypes.ModelCore,
});

export type ModelCore = {
	pack: FlowPack;
	screen: Screen;
	slideIndex: number;
	editPackName: EditPackNameTypes.ModelCore;
};

export const MsgCore = p.or(
	p.obj({
		t: p.l("got-edit-pack-name"),
		c: EditPackNameTypes.MsgCore,
	}),
	p.obj({
		t: p.l("pack-builder.user-clicked-exit-button"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("pack-builder.saved-pack"),
		saved: Result.parser(p.str, FlowPack),
	}),
	p.obj({
		t: p.l("pack-builder.user-opened-add-puzzle-screen"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("pack-builder.user-closed-add-puzzle-screen"),
	}),
	p.obj({
		t: p.l("pack-builder.user-clicked-add-puzzle-item"),
		puzzle: FlowPuzzle,
		userId: UserId,
	}),
	p.obj({
		t: p.l("pack-builder.user-clicked-pack-item"),
		puzzle: FlowPuzzle,
		puzzleIndex: p.num,
	}),
	p.obj({
		t: p.l("pack-builder.user-changed-slide"),
		newSlideIndex: p.num,
		userId: UserId,
	}),
	p.obj({
		t: p.l("pack-builder.flow-play-ui"),
		c: FlowVariantUIPlay.Msg,
	}),
	p.obj({
		t: p.l("pack-builder.puzzle-screen.user-clicked-exit-puzzle-button"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("pack-builder.puzzle-screen.user-clicked-next-puzzle-button"),
		userId: UserId,
		nextPuzzle: FlowPuzzle,
	}),
	p.obj({
		t: p.l("pack-builder.puzzle-screen.user-clicked-previous-puzzle-button"),
		userId: UserId,
		previousPuzzle: FlowPuzzle,
	}),
	p.obj({
		t: p.l("pack-builder.puzzle-screen.user-clicked-more-button"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("pack-builder.puzzle-screen.user-closed-more-drawer"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("remove-puzzle-from-pack.user-clicked-remove-from-pack-button"),
		puzzleIndex: p.num,
		userId: UserId,
	}),
);

export type MsgCore = p.Infer<typeof MsgCore>;
