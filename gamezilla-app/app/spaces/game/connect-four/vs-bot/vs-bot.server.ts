import { GameServer } from "gamezilla-app/app/spaces/@/architecture/game-server";
import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import type {
	SpaceServerCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@/space";
import type { SpaceServerCmd } from "gamezilla-app/app/spaces/@/space-server-cmd";
import { Sub, Time, TimeSpan, isErr } from "gamezilla-app/@/core";
import { ConnectFourBotWorker } from "../@/connect-four";
import * as ConnectFour from "../@/connect-four/connect-four";
import {
	type MsgCore,
	type ModelCore,
	type ModelServer,
	type MsgServer,
	type MsgToClient,
	type MsgToServer,
	isBotMoving,
	isBotTurn,
	toBotPlayer,
} from "./vs-bot.core";

//
//
//
//
//
//
//

type Module = GameServerModule<{
	Model: ModelServer;
	Msg: MsgServer;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	ModelCore: ModelCore;
	MsgCore: MsgCore;
	Ctx: SpaceServerCtx;
	Deps: null;
	MsgInCmd: null;
	MsgInEvent: SpaceServerEvent;
	MsgOutCmd: SpaceServerCmd<MsgToClient>;
	MsgOutEvent: null;
}>;

export const init: Module["init"] = {
	botStartedFindingMoveAt: null,
};

export const update: Module["update"] = async (input) => {
	return GameServerModule.andThen({ model: input.model }, (model) =>
		updateFromMsg({ ...input, model }),
	);
};

const updateFromMsg: Module["update"] = async (input) => {
	const { msg, model, modelCore, ctx } = input;

	if (!msg) {
		return { model };
	}

	switch (msg.t) {
		case "time-passed": {
			const shouldBotMove =
				isBotTurn(modelCore) && !isBotMoving(ctx.now, model);
			if (
				modelCore.type === "game" &&
				shouldBotMove &&
				msg.t === "time-passed"
			) {
				return {
					model: {
						...model,
						botStartedFindingMoveAt: ctx.now,
					},
					eff: async (dispatch) => {
						const found = ConnectFourBotWorker.findBestMove({
							columns: modelCore.columns,
							maxDepth: 4,
							maximizingPlayer: toBotPlayer(modelCore),
						});
						dispatch({
							t: "bot-found-best-move",
							found,
							startedAt: ctx.now,
						});
					},
				};
			}

			return { model };
		}

		case "bot-found-best-move": {
			const { found } = msg;

			return GameServer.chain(
				{ model },
				async (model) => {
					if (isErr(found)) {
						return { model };
					}

					const columnIndex = found.value.columnIndex;

					if (!ConnectFour.isColumnIndex(columnIndex)) {
						return { model };
					}

					const msgCoreNew = withId<MsgCore>({
						t: "bot-dropped-disc",
						columnIndex,
					});

					return {
						model,
						msgCore: [msgCoreNew],
					};
				},
				async (model) => {
					return {
						model: { ...model, botStartedFindingMoveAt: null },
					};
				},
			);
		}
	}
};

export const subscriptions: Module["subscriptions"] = async (input) => {
	if (isBotTurn(input.modelCore)) {
		return Time.interval(`vs-bot`, TimeSpan.fromSeconds(1 / 2), () => ({
			t: "time-passed",
		}));
	}
	return Sub.None;
};
