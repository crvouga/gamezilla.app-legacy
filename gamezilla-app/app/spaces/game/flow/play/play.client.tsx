import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import type { SpaceClientEvent } from "gamezilla-app/app/spaces/@/space";
import type { ClientCmd } from "gamezilla-app/app/@/client";
import { Button, IconArrowLeftOnRect } from "gamezilla-app/app/@/ui";
import { Sub } from "gamezilla-app/@/core";
import { GameLayout } from "../../@/game";
import { FlowVariantUIPlay } from "../@/flow";
import type { FlowClientCtx } from "../@/flow-ctx";
import { samples } from "../@/flow/flow-variant/flow-grid/flow-grid-samples";
import { ViewProfileCard } from "../@/ui";
import type {
	ModelClient,
	ModelCore,
	MsgClient,
	MsgCore,
	MsgToClient,
	MsgToServer,
} from "./play.core";

type Module = GameClientModule<{
	Model: ModelClient;
	Msg: MsgClient;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	MsgCore: MsgCore;
	ModelCore: ModelCore;
	Ctx: FlowClientCtx;
	MsgOutCmd: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>;
	MsgInEvent: SpaceClientEvent;
	MsgOutEvent: null;
	MsgInCmd: null;
}>;

const flow = samples["8x8"][0];
const init: Module["init"] = {
	play: FlowVariantUIPlay.init({ flow }),
	flow,
};

const update: Module["update"] = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		//
		(model) => updateFromMsg({ ...input, model }),
	);
};

const updateFromMsg: Module["update"] = (input) => {
	const { msg, model } = input;

	if (!msg) {
		return { model };
	}

	switch (msg.t) {
		case "grid": {
			const updated = FlowVariantUIPlay.update({
				msg: msg.c,
				model: model.play,
				flow: model.flow,
			});
			return {
				model: {
					play: updated,
					flow: model.flow,
				},
			};
		}

		case "msgCore": {
			const msgCore = withId(msg.c);
			return {
				model,
				msgCore: [msgCore],
			};
		}
	}
};

const subscriptions: Module["subscriptions"] = () => {
	return Sub.None;
};

const USE_GAME_STATE = true;

const View: Module["View"] = (input) => {
	const isPlaying = input.ctx.currentUserId === input.ctx.space.hostId;
	const isSpectating = !isPlaying;
	const host = input.ctx.profiles[input.ctx.space.hostId];
	return (
		<GameLayout isSpectating={isSpectating}>
			<div className="flex w-full flex-1 flex-col items-center justify-center">
				{isSpectating && host && (
					<ViewProfileCard profile={host} subtitle="Player" />
				)}
				{USE_GAME_STATE ? (
					<FlowVariantUIPlay.View
						dispatch={(c) =>
							input.dispatch({ t: "msgCore", c: { t: "grid", c } })
						}
						model={input.modelCore.play}
						disabled={isSpectating}
						flow={input.modelCore.flow}
					/>
				) : (
					<FlowVariantUIPlay.View
						dispatch={(c) => input.dispatch({ t: "grid", c })}
						model={input.model.play}
						flow={input.model.flow}
						disabled={isSpectating}
					/>
				)}
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

export const ViewFeedItem: Module["ViewFeedItem"] = (input) => {
	switch (input.msgCore.t) {
		case "grid": {
			switch (input.msgCore.c.t) {
				case "dragged-over":
				case "left":
				case "pressed-down":
				case "pressed-up": {
					return null;
				}
				default: {
					return null;
				}
			}
		}
	}
};

export const PlayClient: Module = {
	init,
	update,
	subscriptions,
	View,
	ViewFeedItem,
};
