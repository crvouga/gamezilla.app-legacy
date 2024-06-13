import { Eff, Sub } from "gamezilla-app/@/core";
import { Msg } from "gamezilla-app/@/core/msg";
import {
	GameClientModule,
	IUpdate,
	IUpdateLoop,
	IView,
	IViewFeedItem,
} from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { SpaceClientCmd } from "gamezilla-app/app/spaces/@/space-client-cmd";
import { FlowVariantUIPlay } from "../@/flow";
import { FlowPackListClient } from "../@/flow-pack";
import { FlowPackPuzzlesGridClient } from "../@/flow-pack/flow-pack-puzzles-grid/flow-pack-puzzles-grid.client";
import { samples } from "../@/flow/flow-variant/flow-grid/flow-grid-samples";
import type {
	ClientModule,
	ClientModuleTypes,
	FlowPlayClientModule,
	FlowPlayClientModuleTypes,
} from "./play.types";
import { ScreenPackClient } from "./screen-pack/screen-pack.client";
import { ScreenPuzzleClient } from "./screen-puzzle/screen-puzzle.client";
import { ScreenSelectPackClient } from "./screen-select-pack/screen-select-pack.client";

const flow = samples["8x8"][0];
const init: ClientModule["init"] = {
	flowUIPlay: FlowVariantUIPlay.init({ flow }),
	flow,
	flowPackList: FlowPackListClient.initClient,
	flowPackGrid: FlowPackPuzzlesGridClient.initClient,
	flowPacks: {},
	flowPuzzles: {},
};

const update: IUpdate<FlowPlayClientModuleTypes> = (input) => {
	const updatedChild = updateChild({ ...input, msgCmd: null });

	const updated = updateLoop({ ...input, msgCmd: null }, updatedChild);

	const msgCmd = updated.msgCmd?.flatMap((msgCmd) =>
		msgCmd.t === "flow-pack-puzzles-grid" ? [] : [msgCmd],
	);

	return {
		...updated,
		msgCmd,
	};
};

const updateLoop: IUpdateLoop<ClientModuleTypes> = (input, acc) => {
	const [cmd, ...rest] = (acc.msgCmd ?? []).flatMap((cmd) =>
		cmd.t === "flow-pack-puzzles-grid" ? [cmd] : [],
	);

	if (cmd) {
		const updated = updateChild({
			...input,
			model: acc.model,
			msgCmd: cmd,
		});
		return updateLoop(input, {
			model: updated.model,
			msgCmd: Msg.batch(rest, updated.msgCmd),
			eff: Eff.batch([acc.eff, updated.eff]),
			msgCore: Msg.batch(input.msgCore, updated.msgCore),
			msgEvt: Msg.batch(input.msgEvt, updated.msgEvt),
		});
	}

	return acc;
};

const updateChild: IUpdate<ClientModuleTypes> = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		(model) => updateFlowPackList({ ...input, model }),
		(model) => updateFlowPackPuzzlesGrid({ ...input, model }),
		(model) => ScreenPuzzleClient.update({ ...input, model }),
		(model) => ScreenSelectPackClient.update({ ...input, model }),
		(model) => ScreenPackClient.update({ ...input, model }),
	);
};

const updateFlowPackList: IUpdate<ClientModuleTypes> = (input) => {
	const updated = FlowPackListClient.update({
		ctx: input.ctx,
		model: { ...input.model.flowPackList, packs: input.model.flowPacks },
		msg: input.msg?.t === "flow-pack-list" ? input.msg.c : null,
		msgServer:
			input.msgServer?.t === "flow-pack-list" ? input.msgServer.c : null,
		msgEvt: input.msgEvt,
		msgCmd: input.msgCmd,
	});

	return {
		model: {
			...input.model,
			flowPackList: { ...updated.model, packs: {} },
			flowPacks: updated.model.packs,
		},
		eff: Eff.tag("flow-pack-list", updated.eff),
		msgEvt: updated.msgEvt,
		msgCmd: SpaceClientCmd.tag("flow-pack-list", updated.msgCmd),
		msgCore: [],
	};
};

const updateFlowPackPuzzlesGrid: IUpdate<ClientModuleTypes> = (input) => {
	const pack =
		"flowPack" in input.modelCore.screen
			? input.modelCore.screen.flowPack
			: null;

	if (!pack) {
		return { model: input.model };
	}

	const updated = FlowPackPuzzlesGridClient.update({
		ctx: {
			...input.ctx,
			pack,
		},
		model: { ...input.model.flowPackGrid, puzzles: input.model.flowPuzzles },
		msg: input.msg?.t === "flow-pack-grid" ? input.msg.c : null,
		msgServer:
			input.msgServer?.t === "flow-pack-grid" ? input.msgServer.c : null,
		msgEvt: input.msgEvt,
		msgCmd: input.msgCmd,
	});
	return {
		model: {
			...input.model,
			flowPackGrid: { ...updated.model, puzzles: {} },
			flowPuzzles: updated.model.puzzles,
		},
		eff: Eff.tag("flow-pack-grid", updated.eff),
		msgEvt: updated.msgEvt,
		msgCmd: SpaceClientCmd.tag("flow-pack-grid", updated.msgCmd),
		msgCore: [],
	};
};

const subscriptions: ClientModule["subscriptions"] = (input) => {
	switch (input.modelCore.screen.t) {
		case "screen-pack":
		case "screen-puzzle":
			return Sub.tag(
				"flow-pack-grid",
				FlowPackPuzzlesGridClient.subscriptions({
					ctx: {
						...input.ctx,
						pack: input.modelCore.screen.flowPack,
					},
					model: input.model.flowPackGrid,
				}),
			);

		default: {
			return Sub.None;
		}
	}
};

const View: IView<ClientModuleTypes> = (input) => {
	return (
		<div className="flex h-full w-full flex-col">
			<ViewScreen {...input} />
		</div>
	);
};

const ViewScreen: IView<ClientModuleTypes> = (input) => {
	switch (input.modelCore.screen.t) {
		case "screen-pack": {
			return <ScreenPackClient.View {...input} />;
		}

		case "screen-select-pack": {
			return <ScreenSelectPackClient.View {...input} />;
		}

		case "screen-puzzle": {
			return <ScreenPuzzleClient.View {...input} />;
		}

		default: {
			return null;
		}
	}
};

const ViewFeedItem: IViewFeedItem<ClientModuleTypes> = (_input) => {
	return null;
};

export const PlayClient: FlowPlayClientModule = {
	init,
	update,
	subscriptions,
	View,
	ViewFeedItem,
};
