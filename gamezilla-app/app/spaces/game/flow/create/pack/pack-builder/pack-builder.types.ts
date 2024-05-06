import { Result } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { UserId } from "gamezilla-app/app/@/data";
import { FlowVariantUIPlay } from "../../../@/flow";
import { FlowPack } from "../../../@/flow-pack/flow-pack";
import { FlowPackGrid } from "../../../@/flow-pack/flow-pack-grid";
import { FlowPuzzle } from "../../../@/flow-puzzle/flow-puzzle";
import { EditPackNameTypes } from "./edit-pack-name";
import { createNamespace } from "gamezilla-app/@/msg";

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

type Screen =
	| {
			t: "screen-add-puzzle";
	  }
	| {
			t: "screen-puzzle-grid";
	  }
	| {
			t: "screen-puzzle";
			puzzleIndex: number;
			puzzle: FlowPuzzle;
			playUI: FlowVariantUIPlay.Model;
			opened: "more" | null;
	  };

export type ModelCore = EditPackNameTypes.ModelCore & {
	pack: FlowPack;
	screen: Screen;
	slideIndex: number;
};

const createMsg = createNamespace("pack-builder");

export const UserClickedExitButton = createMsg("user-clicked-exit-button");
export const UserOpenedAddPuzzleScreen = createMsg(
	"user-opened-add-puzzle-screen",
);
export const UserClosedAddPuzzleScreen = createMsg(
	"user-closed-add-puzzle-screen",
);
export const UserClickedAddPuzzleItem = createMsg(
	"user-clicked-add-puzzle-item",
);
export const UserClickedPackItem = createMsg("user-clicked-pack-item");
export const UserChangedSlide = createMsg("user-changed-slide");
export const FlowPlayUI = createMsg("flow-play-ui");
export const PuzzleScreenUserClickedExitPuzzleButton = createMsg(
	"puzzle-screen.user-clicked-exit-puzzle-button",
);
export const PuzzleScreenUserClickedNextPuzzleButton = createMsg(
	"puzzle-screen.user-clicked-next-puzzle-button",
);
export const PuzzleScreenUserClickedPreviousPuzzleButton = createMsg(
	"puzzle-screen.user-clicked-previous-puzzle-button",
);
export const PuzzleScreenUserClickedMoreButton = createMsg(
	"puzzle-screen.user-clicked-more-button",
);
export const PuzzleScreenUserClosedMoreDrawer = createMsg(
	"puzzle-screen.user-closed-more-drawer",
);
export const RemovePuzzleFromPackUserClickedRemoveFromPackButton = createMsg(
	"remove-puzzle-from-pack.user-clicked-remove-from-pack-button",
);

export const MsgCore = p.or(
	p.obj({
		t: p.l("pack-builder.got-edit-pack-name-msg"),
		c: EditPackNameTypes.MsgCore,
	}),
	p.obj({
		t: p.l("pack-builder.user-clicked-exit-button"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("pack-builder.saved-pack"),
		saved: p.custom(Result.is(p.is(p.str), p.is(FlowPack.parser)), "invalid"),
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
