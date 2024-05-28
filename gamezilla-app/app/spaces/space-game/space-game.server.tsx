import { Eff, Result, Sub } from "gamezilla-app/@/core";
import { GameServer } from "../game/game.server";
import type { WithEventId } from "../@/event";
import { SpaceServerCmd } from "../@/space-server-cmd";
import { SpaceServerModule } from "../architecture/space-server";
import type { SpaceEvent } from "../spaces-core";
import { SpacesCoreServer } from "../spaces-core/spaces-core.server";
import type { MsgServer } from "../spaces.types";

const inputToSpaceId = (input: Parameters<SpaceServerModule["update"]>[0]) => {
	if (input.msg && "spaceId" in input.msg) {
		return input.msg.spaceId;
	}

	if (input.msgClient && "spaceId" in input.msgClient) {
		return input.msgClient.spaceId;
	}

	if (input.msgSpaceEvent && "spaceId" in input.msgSpaceEvent) {
		return input.msgSpaceEvent.spaceId;
	}

	return null;
};

const updateGame: SpaceServerModule["update"] = async (input) => {
	const spaceId = inputToSpaceId(input);

	if (!spaceId) {
		return { model: input.model };
	}

	const spaceState = await SpacesCoreServer.getSpaceStarted(
		input.deps.SpacesDb,
		spaceId,
	);

	if (!spaceState) {
		return { model: input.model };
	}

	if (!spaceState.game) {
		return { model: input.model };
	}

	if (input.msgClient && !input.msgClient.userId) {
		input.ctx.logger.warn("msgClient is missing userId");
	}

	const gameModel = Result.withDefault(
		await input.deps.GameDb.getBySpaceId(spaceId),
		null,
	);

	const gameUpdated = await GameServer.update({
		ctx: { ...input.ctx, space: spaceState },
		model: gameModel ?? GameServer.init(spaceState.game.t),
		msg: input.msg?.t === "game" ? input.msg.c : null,
		msgClient:
			input.msgClient?.t === "game" && input.msgClient.userId
				? {
						...input.msgClient,
						userId: input.msgClient.userId,
						...input.msgClient.c,
					}
				: null,
		msgEvt: input.msgEvt,
		msgCore:
			input.msgSpaceEvent?.t === "game"
				? { ...input.msgSpaceEvent, ...input.msgSpaceEvent.c }
				: null,
		modelCore: spaceState.game,
		deps: input.deps.GameServer,
	});

	const msgSpaceEventNew = (gameUpdated.msgCore ?? []).map(
		(e): WithEventId<SpaceEvent> => ({ ...e, spaceId, t: "game", c: e }),
	);

	return {
		model: input.model,
		eff: Eff.map((c) => ({ t: "game", c, spaceId }), gameUpdated.eff),
		msgCmd: SpaceServerCmd.map(gameUpdated.msgCmd, (c) => ({
			t: "game",
			c,
			spaceId,
		})),
		msgEvt: [],
		msgSpaceEvent: msgSpaceEventNew,
	};
};

const update: SpaceServerModule["update"] = async (input) => {
	return SpaceServerModule.andThen(
		{ model: input.model },
		//
		(model) => updateGame({ ...input, model }),
	);
};

const subscriptions: SpaceServerModule["subscriptions"] = async (_input) => {
	const batch: Sub<MsgServer>[] = [];

	return Sub.batch(batch);
};

export const SpaceGameServer = {
	subscriptions,
	update,
};
