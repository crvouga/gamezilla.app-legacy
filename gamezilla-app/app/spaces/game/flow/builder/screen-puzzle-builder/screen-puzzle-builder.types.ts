import { UserId } from "gamezilla-app/app/@/data";
import {
	type FlowVariant,
	FlowVarianEdit,
	FlowVariantPlay,
} from "../../@/flow";
import { FlowPuzzle } from "../../@/flow-puzzle/flow-puzzle";
import { p } from "gamezilla-app/@/core/parser";
import { PuzzleSaveChanges } from "./save-changes";
import { EditPuzzleNameTypes } from "./edit-puzzle-name";
import { PuzzleDeleteForever } from "./delete-forever";

export type ModelClient = PuzzleSaveChanges.ModelClient &
	EditPuzzleNameTypes.ModelClient &
	PuzzleDeleteForever.ModelClient;

export const initClient: ModelClient = {
	...EditPuzzleNameTypes.initClient,
	...PuzzleDeleteForever.initClient,
};

export type ModelServer = null;

export type MsgServer =
	| PuzzleSaveChanges.MsgServer
	| PuzzleDeleteForever.MsgServer
	| EditPuzzleNameTypes.MsgServer;

export type MsgClient =
	| EditPuzzleNameTypes.MsgClient
	| PuzzleDeleteForever.MsgClient
	| PuzzleSaveChanges.MsgClient
	| { t: "screen-puzzle-builder.flow-ui-edit"; c: FlowVarianEdit.Msg }
	| { t: "screen-puzzle-builder.flow-ui-play"; c: FlowVariantPlay.Msg }
	| { t: "screen-puzzle-builder.user-clicked-more-button" }
	| { t: "screen-puzzle-builder.user-closed-more-drawer" }
	| { t: "screen-puzzle-builder.user-clicked-exit-button" }
	| { t: "screen-puzzle-builder.user-clicked-edit-mode-button" }
	| { t: "screen-puzzle-builder.user-clicked-play-mode-button" };

export type MsgToClient =
	| PuzzleSaveChanges.MsgToClient
	| PuzzleDeleteForever.MsgToClient
	| EditPuzzleNameTypes.MsgToClient;

export type MsgToServer =
	| PuzzleSaveChanges.MsgToServer
	| PuzzleDeleteForever.MsgToServer
	| EditPuzzleNameTypes.MsgToServer;

//
//
//
//
//
//

const Mode = p.or(p.obj({ t: p.l("play") }), p.obj({ t: p.l("edit") }));
type Mode = p.Infer<typeof Mode>;

export const ModelCore = p.obj({
	t: p.l("puzzle-builder"),
	puzzle: FlowPuzzle,
	mode: Mode,
	play: FlowVariantPlay.Model,
	edit: FlowVarianEdit.Model,
});
export type ModelCore = p.Infer<typeof ModelCore>;

export const toCurrentFlow = (modelCore: ModelCore): FlowVariant.Model => {
	switch (modelCore.mode.t) {
		case "edit": {
			return FlowVarianEdit.deriveFlowMemoized({
				model: modelCore.edit,
			});
		}

		case "play": {
			return FlowVariantPlay.toFlow({
				flow: FlowVarianEdit.deriveFlowMemoized({
					model: modelCore.edit,
				}),
				model: modelCore.play,
			});
		}
	}
};

export const MsgCore = p.or(
	PuzzleSaveChanges.MsgCore,
	PuzzleDeleteForever.MsgCore,
	EditPuzzleNameTypes.MsgCore,
	p.obj({
		t: p.l("screen-puzzle-builder.flow-ui-play"),
		c: FlowVariantPlay.Msg,
	}),
	p.obj({
		t: p.l("screen-puzzle-builder.flow-ui-edit"),
		c: FlowVarianEdit.Msg,
	}),
	p.obj({
		t: p.l("screen-puzzle-builder.user-clicked-edit-mode-button"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("screen-puzzle-builder.user-clicked-play-mode-button"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("screen-puzzle-builder.user-clicked-exit-button"),
		userId: UserId,
	}),
);

export type MsgCore = p.Infer<typeof MsgCore>;
