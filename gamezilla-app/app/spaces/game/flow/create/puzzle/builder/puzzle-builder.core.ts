import type { UserId } from "gamezilla-app/app/@shared/data";
import {
	type FlowVariant,
	FlowVariantUIEdit,
	FlowVariantUIPlay,
} from "../../../@shared/flow";
import type { FlowPuzzle } from "../../../@shared/flow-puzzle/flow-puzzle";

export type ModelClient = {};

export const initClient: ModelClient = {};

export type ModelServer = {};

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

type Mode =
	| {
			t: "play";
	  }
	| {
			t: "edit";
	  };

export type ModelSync = {
	t: "puzzle-builder";
	puzzle: FlowPuzzle;
	mode: Mode;
	play: FlowVariantUIPlay.Model;
	edit: FlowVariantUIEdit.Model;
};

export const toCurrentFlow = (modelSync: ModelSync): FlowVariant.Model => {
	switch (modelSync.mode.t) {
		case "edit": {
			return FlowVariantUIEdit.toCurrentFlow({
				model: modelSync.edit,
			});
		}

		case "play": {
			return FlowVariantUIPlay.toCurrentFlow({
				flow: FlowVariantUIEdit.toCurrentFlow({
					model: modelSync.edit,
				}),
				model: modelSync.play,
			});
		}
	}
};

export type MsgSync =
	| {
			t: "puzzle-builder.flow-ui-play";
			c: FlowVariantUIPlay.Msg;
	  }
	| {
			t: "puzzle-builder.flow-ui-edit";
			c: FlowVariantUIEdit.Msg;
	  }
	| {
			t: "puzzle-builder.user-clicked-edit-mode-button";
			userId: UserId;
	  }
	| {
			t: "puzzle-builder.user-clicked-play-mode-button";
			userId: UserId;
	  }
	| {
			t: "puzzle-builder.user-clicked-exit-button";
			userId: UserId;
	  };
