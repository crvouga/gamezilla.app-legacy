import { GameClientModule } from "gamezilla-app/app/spaces/@shared/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@shared/event";
import type { SpaceClientEvent } from "gamezilla-app/app/spaces/@shared/space";
import type { ClientCmd } from "gamezilla-app/app/@shared/client";
import { Button, IconArrowLeftOnRect } from "gamezilla-app/app/@shared/ui";
import { Sub } from "gamezilla-app/@shared/core";
import { GameLayout } from "../../@shared/game";
import { FlowVariantUIPlay } from "../@shared/flow";
import type { FlowClientCtx } from "../@shared/flow-ctx";
import { samples } from "../@shared/flow/flow-variant/flow-grid/flow-grid-samples";
import { ViewProfileCard } from "../@shared/ui";
import type {
	ModelClient,
	ModelSync,
	MsgClient,
	MsgSync,
	MsgToClient,
	MsgToServer,
} from "./play.core";

type Module = GameClientModule<{
	Model: ModelClient;
	Msg: MsgClient;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	MsgSync: MsgSync;
	ModelSync: ModelSync;
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

		case "msgSync": {
			const msgSync = withId(msg.c);
			return {
				model,
				msgSync: [msgSync],
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
							input.dispatch({ t: "msgSync", c: { t: "grid", c } })
						}
						model={input.modelSync.play}
						disabled={isSpectating}
						flow={input.modelSync.flow}
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
	switch (input.msgSync.t) {
		case "grid": {
			switch (input.msgSync.c.t) {
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
