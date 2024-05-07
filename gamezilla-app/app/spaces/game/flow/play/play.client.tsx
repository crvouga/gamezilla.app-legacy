import { Sub } from "gamezilla-app/@/core";
import type { ClientCmd } from "gamezilla-app/app/@/client";
import { Button, IconArrowLeftOnRect } from "gamezilla-app/app/@/ui";
import type { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import type { SpaceClientEvent } from "gamezilla-app/app/spaces/@/space";
import { GameLayout } from "../../@/game";
import { FlowVariantUIPlay } from "../@/flow";
import type { FlowClientCtx } from "../@/flow-ctx";
import { FlowPackListClient } from "../@/flow-pack";
import { samples } from "../@/flow/flow-variant/flow-grid/flow-grid-samples";
import { ViewProfileCard } from "../@/ui";
import {
	GotFlowPlayMsg,
	type ModelClient,
	type ModelCore,
	type MsgClient,
	type MsgCore,
	type MsgToClient,
	type MsgToServer,
} from "./play.types";

type ClientModule = GameClientModule<{
	Model: ModelClient;
	Msg: MsgClient;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	MsgCore: MsgCore;
	ModelCore: ModelCore;
	Ctx: FlowClientCtx;
	MsgCmdOut: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>;
	MsgEvtIn: SpaceClientEvent;
}>;

const flow = samples["8x8"][0];
const init: ClientModule["init"] = {
	play: FlowVariantUIPlay.init({ flow }),
	flow,
	packList: FlowPackListClient.initClient,
};

const update: ClientModule["update"] = (input) => {
	if (GotFlowPlayMsg.is(input.msg)) {
		return {
			model: input.model,
			msgCore: [withId(input.msg)],
		};
	}

	return { model: input.model };
};

const subscriptions: ClientModule["subscriptions"] = () => {
	return Sub.None;
};

const View: ClientModule["View"] = (input) => {
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
						const msg = GotFlowPlayMsg({
							c,
						});
						console.log("msg", msg, "c", c);
						input.dispatch(msg);
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
