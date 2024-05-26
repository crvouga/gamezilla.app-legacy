import { UserId } from "gamezilla-app/app/@/data";
import {
	type FlowVariant,
	FlowVariantUIEdit,
	FlowVariantUIPlay,
} from "../../../@/flow";
import { FlowPuzzle } from "../../../@/flow-puzzle/flow-puzzle";
import { p } from "gamezilla-app/@/core/parser";

export type ModelClient = null;

export const initClient: ModelClient = null;

export type ModelServer = null;

export type MsgServer = { t: "noop" };

export type MsgClient =
	| { t: "puzzle-builder.flow-ui-edit"; c: FlowVariantUIEdit.Msg }
	| { t: "puzzle-builder.flow-ui-play"; c: FlowVariantUIPlay.Msg }
	| { t: "puzzle-builder.user-clicked-more-button" }
	| { t: "puzzle-builder.user-closed-more-drawer" }
	| { t: "puzzle-builder.user-clicked-exit-button" }
	| { t: "puzzle-builder.user-clicked-edit-mode-button" }
	| { t: "puzzle-builder.user-clicked-play-mode-button" };

export type MsgToClient = { t: "noop" };

export type MsgToServer = { t: "noop" };

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
	play: FlowVariantUIPlay.Model,
	edit: FlowVariantUIEdit.Model,
});
export type ModelCore = p.Infer<typeof ModelCore>;

export const toCurrentFlow = (modelCore: ModelCore): FlowVariant.Model => {
	switch (modelCore.mode.t) {
		case "edit": {
			return FlowVariantUIEdit.toCurrentFlow({
				model: modelCore.edit,
			});
		}

		case "play": {
			return FlowVariantUIPlay.deriveFlow({
				flow: FlowVariantUIEdit.toCurrentFlow({
					model: modelCore.edit,
				}),
				model: modelCore.play,
			});
		}
	}
};

export const MsgCore = p.or(
	p.obj({ t: p.l("puzzle-builder.flow-ui-play"), c: FlowVariantUIPlay.Msg }),
	p.obj({ t: p.l("puzzle-builder.flow-ui-edit"), c: FlowVariantUIEdit.Msg }),
	p.obj({
		t: p.l("puzzle-builder.user-clicked-edit-mode-button"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("puzzle-builder.user-clicked-play-mode-button"),
		userId: UserId,
	}),
	p.obj({ t: p.l("puzzle-builder.user-clicked-exit-button"), userId: UserId }),
);

export type MsgCore = p.Infer<typeof MsgCore>;
