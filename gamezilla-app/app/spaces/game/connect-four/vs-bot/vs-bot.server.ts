import { GameServer } from "gamezilla-app/app/spaces/@shared/architecture/game-server";
import { GameServerModule } from "gamezilla-app/app/spaces/@shared/architecture/game-server-v2";
import { withId } from "gamezilla-app/app/spaces/@shared/event";
import type {
	SpaceServerCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@shared/space";
import type { SpaceServerCmd } from "gamezilla-app/app/spaces/@shared/space-server-cmd";
import { Sub, Time, TimeSpan, isErr } from "gamezilla-app/@shared/core";
import { ConnectFourBotWorker } from "../@shared/connect-four";
import * as ConnectFour from "../@shared/connect-four/connect-four";
import {
	type MsgSync,
	type ModelSync,
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
	ModelSync: ModelSync;
	MsgSync: MsgSync;
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
	const { msg, model, modelSync, ctx } = input;

	if (!msg) {
		return { model };
	}

	switch (msg.t) {
		case "time-passed": {
			const shouldBotMove =
				isBotTurn(modelSync) && !isBotMoving(ctx.now, model);
			if (
				modelSync.type === "game" &&
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
							columns: modelSync.columns,
							maxDepth: 4,
							maximizingPlayer: toBotPlayer(modelSync),
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

					const msgSyncNew = withId<MsgSync>({
						t: "bot-dropped-disc",
						columnIndex,
					});

					return {
						model,
						msgSync: [msgSyncNew],
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
	if (isBotTurn(input.modelSync)) {
		return Time.interval(`vs-bot`, TimeSpan.fromSeconds(1 / 2), () => ({
			t: "time-passed",
		}));
	}
	return Sub.None;
};
