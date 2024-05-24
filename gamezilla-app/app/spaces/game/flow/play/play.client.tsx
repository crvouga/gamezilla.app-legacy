import { Eff, Sub } from "gamezilla-app/@/core";
import { Button, IconArrowLeftOnRect } from "gamezilla-app/app/@/ui";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { SpaceClientCmd } from "gamezilla-app/app/spaces/@/space-client-cmd";
import { GameLayout } from "../../@/game";
import { ViewProfileCard } from "../../@/game/view-profile-card";
import { FlowVariantUIPlay } from "../@/flow";
import { FlowPackListClient } from "../@/flow-pack";
import { samples } from "../@/flow/flow-variant/flow-grid/flow-grid-samples";
import { ClientModule } from "./play.types";
import { ScreenPackClient } from "./screen-pack/screen-pack.client";
import { SelectPackScreenClient } from "./screen-select-pack/screen-select-pack.client";

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
		(model) => SelectPackScreenClient.update({ ...input, model }),
		(model) => ScreenPackClient.update({ ...input, model }),
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
		model: { ...input.model.packList, packs: input.model.flowPacks },
		msg: input.msg?.t === "flow-pack-list" ? input.msg.c : null,
		msgServer:
			input.msgServer?.t === "flow-pack-list" ? input.msgServer.c : null,
		msgEvt: input.msgEvt,
		msgCmd: input.msgCmd,
	});

	return {
		model: {
			...input.model,
			packList: { ...updated.model, packs: {} },
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
	switch (input.modelCore.screen.t) {
		case "pack": {
			return <ScreenPackClient.View {...input} />;
		}
		case "select-pack": {
			return <SelectPackScreenClient.View {...input} />;
		}
		default: {
			return null;
		}
	}
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
