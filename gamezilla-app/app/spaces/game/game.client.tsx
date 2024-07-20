import type {
	SpaceClientCtx,
	SpaceClientEvent,
} from "gamezilla-app/app/spaces/@/space";
import { Sub } from "gamezilla-app/@/core";
import { GameClientModule } from "../@/architecture/game-client-v2";
import { SpaceClientCmd } from "../@/space-client-cmd";
import { ConnectFour } from "./connect-four/connect-four.client";
import { FlowClient } from "./flow/flow.client";
import type {
	GameName,
	ModelClient,
	ModelCore,
	MsgClient,
	MsgCore,
	MsgToClient,
	MsgToServer,
} from "./game.types";

//
//
//
//
//
//
//

type Module = GameClientModule<{
	Model: ModelClient;
	Msg: MsgClient;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	ModelCore: ModelCore;
	MsgCore: MsgCore;
	Ctx: SpaceClientCtx;
	MsgEvtIn: SpaceClientEvent;
	MsgCmdOut: SpaceClientCmd<{
		MsgClient: MsgClient;
		MsgToServer: MsgToServer;
	}>;
}>;

//
//
//
// Model
//
//
//

const init = (gameName: GameName): Module["init"] => {
	switch (gameName) {
		case "connect-four": {
			return {
				t: "connect-four",
				c: ConnectFour.init,
			};
		}

		case "flow": {
			return {
				t: "flow",
				c: FlowClient.init,
			};
		}
		
		default: {
			throw new Error(`Unknown game name: ${gameName}`);
		}
	}
};

//
//
//
// Update
//
//
//

const update: Module["update"] = (input) => {
	switch (input.modelCore.t) {
		case "connect-four": {
			const updated = ConnectFour.update({
				ctx: input.ctx,
				modelCore: input.modelCore.c,
				model:
					input.model?.t === "connect-four" ? input.model.c : ConnectFour.init,
				msgCmd: input.msgCmd,
				msgEvt: input.msgEvt,
				msgServer:
					input.msgServer?.t === "connect-four" ? input.msgServer.c : null,
				msgCore:
					input.msgCore?.t === "connect-four"
						? { ...input.msgCore, ...input.msgCore.c }
						: null,
				msg: input.msg?.t === "connect-four" ? input.msg.c : null,
			});

			const tagged = GameClientModule.tagOutput(
				"connect-four",
				(msgCmd) => SpaceClientCmd.tag("connect-four", msgCmd),
				updated,
			);

			return tagged;
		}

		case "flow": {
			const updated = FlowClient.update({
				ctx: input.ctx,
				modelCore: input.modelCore.c,
				model: input.model?.t === "flow" ? input.model.c : FlowClient.init,
				msgCmd: input.msgCmd,
				msgEvt: input.msgEvt,
				msgServer: input.msgServer?.t === "flow" ? input.msgServer.c : null,
				msgCore:
					input.msgCore?.t === "flow"
						? { ...input.msgCore, ...input.msgCore.c }
						: null,
				msg: input.msg?.t === "flow" ? input.msg.c : null,
			});

			const tagged = GameClientModule.tagOutput(
				"flow",
				(msgCmd) => SpaceClientCmd.tag("flow", msgCmd),
				updated,
			);

			return tagged;
		}
	}
};

//
//
//
// Subscriptions
//
//
//

const subscriptions: Module["subscriptions"] = (input) => {
	const { modelCore, model } = input;

	switch (modelCore.t) {
		case "connect-four": {
			return Sub.tag(
				"connect-four",
				ConnectFour.subscriptions({
					ctx: input.ctx,
					modelCore: modelCore.c,
					model: model.t === "connect-four" ? model.c : ConnectFour.init,
				}),
			);
		}

		case "flow": {
			return Sub.tag(
				"flow",
				FlowClient.subscriptions({
					ctx: input.ctx,
					modelCore: modelCore.c,
					model: model.t === "flow" ? model.c : FlowClient.init,
				}),
			);
		}
	}
};

//
//
//
// View
//
//
//

const View: Module["View"] = (input) => {
	const { model, ctx, modelCore, dispatch } = input;

	switch (modelCore.t) {
		case "connect-four": {
			return (
				<ConnectFour.View
					ctx={ctx}
					dispatch={(c) => dispatch({ t: "connect-four", c })}
					modelCore={modelCore.c}
					model={model?.t === "connect-four" ? model.c : ConnectFour.init}
				/>
			);
		}

		case "flow": {
			return (
				<FlowClient.View
					ctx={ctx}
					dispatch={(c) => {
						dispatch({ t: "flow", c });
					}}
					modelCore={modelCore.c}
					model={model.t === "flow" ? model.c : FlowClient.init}
				/>
			);
		}
	}
};

const ViewFeedItem: Module["ViewFeedItem"] = (input) => {
	const { msgCore, modelCore, ctx, dispatch } = input;

	switch (modelCore.t) {
		case "connect-four": {
			switch (msgCore.t) {
				case "connect-four": {
					return (
						<ConnectFour.ViewFeedItem
							ctx={ctx}
							msgCore={msgCore.c}
							modelCore={modelCore.c}
							dispatch={(c) => dispatch({ t: "connect-four", c })}
						/>
					);
				}
				default: {
					return null;
				}
			}
		}

		default: {
			return null;
		}
	}
};

export const GameClient = {
	init,
	subscriptions,
	update,
	View,
	ViewFeedItem,
};
