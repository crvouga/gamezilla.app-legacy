import { Eff, Result, Sub } from "gamezilla-app/@/core";
import type { UserId } from "gamezilla-app/app/@/data";
import { sendToClient } from "gamezilla-app/app/@/server";
import type {
	SpaceReqCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@/space";
import { SpaceServerCmd } from "gamezilla-app/app/spaces/@/space-server-cmd";
import type {
	ModelServer,
	MsgServer,
	MsgToClient,
	MsgToServer,
} from "./tic-tac-toe.types";
import * as VsBot from "./vs-bot/vs-bot.server";
import * as VsUser from "./vs-user/vs-user.server";

const { Err, Ok } = Result;

//
//
//
// Model
//
//
//

export type Model = ModelServer;

export const init: Model = { t: "none" };

//
//
//
// Update
//
//
//

export type Msg = MsgServer;

export const update = ({
	msg,
	model,
}: {
	msg: Msg;
	model: Model;
}): {
	model: Model;
	eff?: Eff<Msg>;
	msgCmd?: SpaceServerCmd<MsgToClient>[];
} => {
	if (msg.t === "vs-user" && model.t === "vs-user") {
		const updated = VsUser.update(msg.c, model.c);
		return {
			model: { t: "vs-user", c: updated.model },
			msgCmd: SpaceServerCmd.tag("vs-user", updated.msgCmd),
		};
	}

	if (msg.t === "vs-bot" && model.t === "vs-bot") {
		const updated = VsBot.update({
			model: model.c,
			msg: msg.c,
		});

		return {
			model: { t: "vs-bot", c: updated.model },
			msgCmd: SpaceServerCmd.tag("vs-bot", updated.msgCmd),
		};
	}

	return { model };
};

export const updateFromClient = ({
	msg,
	model,
	ctx,
}: {
	ctx: SpaceReqCtx;
	msg: MsgToServer;
	model: Model;
}): {
	model: Model;
	eff?: Eff<Msg>;
	msgCmd?: SpaceServerCmd<MsgToClient>[];
} => {
	if (msg.t === "input-mode") {
		if (ctx.currentUserId !== ctx.space.hostId) {
			return {
				model,
				msgCmd: [
					sendToClient([ctx.clientId], {
						...msg,
						result: Err("must-be-host"),
					}),
				],
			};
		}

		const modelNew: ModelServer = initMode({
			mode: msg.mode,
			userId: ctx.space.hostId,
		});

		return {
			model: modelNew,
			msgCmd: [
				{
					t: "send-to-space",
					msg: {
						t: "input-mode",
						mode: msg.mode,
						result: Ok(modelNew),
					},
				},
			],
		};
	}

	if (msg.t === "vs-user" && model.t === "vs-user") {
		const updated = VsUser.updateFromClient(ctx, msg.c, model.c);

		return {
			model: { ...model, c: updated.model },
			msgCmd: SpaceServerCmd.tag("vs-user", updated.msgCmd),
		};
	}

	if (msg.t === "vs-bot" && model.t === "vs-bot") {
		const updated = VsBot.updateFromClient({
			msg: msg.c,
			model: model.c,
			ctx,
		});

		return {
			model: { ...model, c: updated.model },
			eff: Eff.tag("vs-bot", updated.eff),
			msgCmd: SpaceServerCmd.tag("vs-bot", updated.msgCmd),
		};
	}

	return { model };
};

export const updateFromEvent = ({
	msg,
	model,
}: {
	model: Model;
	msg: SpaceServerEvent;
}): {
	model: Model;
	msgCmd?: SpaceServerCmd<MsgToClient>[];
} => {
	if (model.t === "none") {
		return { model };
	}

	if (model.t === "vs-bot") {
		const updated = VsBot.updateFromEvent({
			msg,
			model: model.c,
		});
		return {
			model: { t: "vs-bot", c: updated.model },
			msgCmd: SpaceServerCmd.tag("vs-bot", updated.msgCmd),
		};
	}

	if (model.t === "vs-user") {
		const updated = VsUser.updateFromEvent({
			msg,
			model: model.c,
		});
		return {
			model: { t: "vs-user", c: updated.model },
			msgCmd: SpaceServerCmd.tag("vs-user", updated.msgCmd),
		};
	}

	return { model };
};

const initMode = ({
	mode,
	userId,
}: {
	mode: ModelServer["t"];
	userId: UserId;
}): ModelServer => {
	switch (mode) {
		case "none": {
			return { t: "none" };
		}

		case "vs-user": {
			return {
				t: "vs-user",
				c: VsUser.init({ X: userId, O: "none" }),
			};
		}

		case "vs-bot": {
			return {
				t: "vs-bot",
				c: VsBot.init({ userId }),
			};
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

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
	switch (model.t) {
		case "vs-bot": {
			return Sub.tag("vs-bot", VsBot.subscriptions(model.c));
		}
		case "vs-user": {
			return Sub.tag("vs-user", VsUser.subscriptions(intervalId, model.c));
		}
		case "none": {
			return Sub.None;
		}
	}
};
