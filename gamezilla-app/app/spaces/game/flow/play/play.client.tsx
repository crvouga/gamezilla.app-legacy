import { Eff, Sub } from "gamezilla-app/@/core";
import { Button, IconArrowLeftOnRect } from "gamezilla-app/app/@/ui";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import type { SpaceClientEvent } from "gamezilla-app/app/spaces/@/space";
import { SpaceClientCmd } from "gamezilla-app/app/spaces/@/space-client-cmd";
import { GameLayout, ViewBottomBarExitButton } from "../../@/game";
import { FlowVariantUIPlay } from "../@/flow";
import type { FlowClientCtx } from "../@/flow-ctx";
import { FlowPackListClient } from "../@/flow-pack";
import { samples } from "../@/flow/flow-variant/flow-grid/flow-grid-samples";
import { ViewProfileCard } from "../../@/game/view-profile-card";
import {
	type ModelClient,
	type ModelCore,
	type MsgClient,
	type MsgCore,
	type MsgToClient,
	type MsgToServer,
} from "./play.types";
import { ViewScreenTitle } from "../../@/game/view-screen-title";

type ClientModule = GameClientModule<{
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

const flow = samples["8x8"][0];
const init: ClientModule["init"] = {
	play: FlowVariantUIPlay.init({ flow }),
	flow,
	packList: FlowPackListClient.initClient,
	flowPacks: {},
	flowPuzzles: {},
};

const update: ClientModule["update"] = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		(model) => updateFlowPackList({ ...input, model }),
		(model) => updateFlowPlayUI({ ...input, model }),
	);
};

const updateFlowPlayUI: ClientModule["update"] = (input) => {
	switch (input.msg?.t) {
		case "flow-play-ui": {
			return { model: input.model, msgCore: [withId(input.msg)] };
		}
		default: {
			return { model: input.model };
		}
	}
};

const updateFlowPackList: ClientModule["update"] = (input) => {
	const updated = FlowPackListClient.update({
		ctx: input.ctx,
		model: {...input.model.packList, packs: input.model.flowPacks},
		msg: input.msg?.t === "flow-pack-list" ? input.msg.c : null,
		msgServer:
			input.msgServer?.t === "flow-pack-list" ? input.msgServer.c : null,
		msgEvt: input.msgEvt,
		msgCmd: input.msgCmd,
	});

	return {
		model: {
			...input.model,
			packList: updated.model,
			flowPacks: updated.model.packs,
		},
		eff: Eff.tag("flow-pack-list", updated.eff),
		msgEvt: updated.msgEvt,
		msgCmd: SpaceClientCmd.tag("flow-pack-list", updated.msgCmd),
		msgCore: [],
	};
};

const subscriptions: ClientModule["subscriptions"] = () => {
	return Sub.None;
};

export const ViewGame: ClientModule["View"] = (input) => {
	const isPlaying = input.ctx.currentUserId === input.ctx.space.hostId;
	const isSpectating = !isPlaying;
	const host = input.ctx.profiles[input.ctx.space.hostId];
	return (
		<GameLayout isSpectating={isSpectating}>
			<div className="flex w-full flex-1 flex-col items-center justify-center">
				{isSpectating && host && (
					<ViewProfileCard profile={host} subtitle="Player" />
				)}

				<FlowVariantUIPlay.View
					dispatch={(c) => {
						input.dispatch({
							t: "flow-play-ui",
							c,
						});
					}}
					model={input.modelCore.play}
					disabled={isSpectating}
					flow={input.modelCore.flow}
				/>
			</div>
			{isPlaying && (
				<div className="w-full p-4">
					<Button
						className="w-full"
						onClick={input.ctx.onQuit}
						start={<IconArrowLeftOnRect className="h-6 w-6" />}
						text="Exit"
					/>
				</div>
			)}
		</GameLayout>
	);
};

const View: ClientModule["View"] = (input) => {
	return (
		<div className="w-full h-full flex-1 flex flex-col">
			<ViewScreenTitle
				title={input.ctx.t('flow.play')}
			/>
			<FlowPackListClient.View
				ctx={input.ctx}
				dispatch={(c) => input.dispatch({ t: "flow-pack-list", c })}
				model={input.model.packList}
			/>
			<ViewBottomBarExitButton ctx={input.ctx} onClick={input.ctx.onQuit} />
		</div>
	);
};

export const ViewFeedItem: ClientModule["ViewFeedItem"] = (_input) => {
	return null;
};

export const PlayClient: ClientModule = {
	init,
	update,
	subscriptions,
	View,
	ViewFeedItem,
};
