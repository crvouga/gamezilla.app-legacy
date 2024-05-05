import { Eff, Result, Sub } from "gamezilla-app/@/core";
import { GameServer } from "../game/game.server";
import type { WithEventId } from "../@/event";
import { SpaceServerCmd } from "../@/space-server-cmd";
import { SpaceServerModule } from "../architecture/space-server";
import type { SpaceEvent } from "../spaces-core";
import { SpacesCoreServer } from "../spaces-core/spaces-core.server";
import type { MsgServer } from "../spaces.core";

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
	const { msg, msgEvt, msgClient, msgSpaceEvent, ctx, model, deps } = input;

	const spaceId = inputToSpaceId(input);

	if (!spaceId) {
		return { model };
	}

	const spaceState = await SpacesCoreServer.getSpaceStarted(
		input.deps.SpacesDb,
		spaceId,
	);

	if (!spaceState) {
		return { model };
	}

	if (!spaceState.game) {
		return { model };
	}

	if (msgClient && !msgClient.userId) {
		ctx.logger.warn("msgClient is missing userId");
	}

	const gameModel = Result.withDefault(
		await deps.GameDb.getBySpaceId(spaceId),
		null,
	);

	const gameUpdated = await GameServer.update({
		ctx: { ...ctx, space: spaceState },
		model: gameModel ?? GameServer.init(spaceState.game.t),
		msg: msg?.t === "game" ? msg.c : null,
		msgClient:
			msgClient?.t === "game" && msgClient.userId
				? { ...msgClient, userId: msgClient.userId, ...msgClient.c }
				: null,
		msgEvt,
		msgCore:
			msgSpaceEvent?.t === "game"
				? { ...msgSpaceEvent, ...msgSpaceEvent.c }
				: null,
		modelCore: spaceState.game,
		deps: null,
	});

	const msgSpaceEventNew = (gameUpdated.msgCore ?? []).map(
		(e): WithEventId<SpaceEvent> => ({ ...e, spaceId, t: "game", c: e }),
	);

	return {
		model,
		eff: Eff.map_((c) => ({ t: "game", c, spaceId }), gameUpdated.eff),
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
