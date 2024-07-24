import { Eff, Sub } from "gamezilla-app/@/core";
import {
	APP_SOUND,
	type ClientCtx,
	playSound,
} from "gamezilla-app/app/@/client";
import { TopBar, Typography } from "gamezilla-app/app/@/ui";
import { type WithEventId, withId } from "../@/event";
import { SpaceClientCmd } from "../@/space-client-cmd";
import { SpaceClientModule } from "../architecture/architecture";
import { ViewUsersInSpaceList } from "../game/@/game";
import { CoverArt } from "../game/game-cover-art";
import { GameClient } from "../game/game.client";
import { gameNameList } from "../game/game.types";
import { SpaceCore, type SpaceCoreEvent } from "../spaces-core";
import * as SpacesCoreClient from "../spaces-core/spaces-core.client";
import type { MsgClient } from "../spaces.types";

const update: SpaceClientModule["update"] = (input) => {
	return SpaceClientModule.andThen(
		{ model: input.model },
		//
		(model) => updateGame({ ...input, model }),
		(model) => updateFromSpaceEvent({ ...input, model }),
		(model) => updateFromMsg({ ...input, model }),
		(model) => updateFromCmd({ ...input, model }),
	);
};

const updateFromMsg: SpaceClientModule["update"] = ({ msg, model, ctx }) => {
	switch (msg?.t) {
		case "clicked-game-tile": {
			const currentUserId = ctx.currentUserId;

			const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(
				model,
				currentUserId,
			);

			if (!currentUserId || !currentUserSpaceId) {
				return { model };
			}

			const spaceEventNew = withId<SpaceCoreEvent>({
				t: "user-inputted-game",
				game: msg.gameName,
				spaceId: currentUserSpaceId,
				userId: currentUserId,
			});

			return {
				model,
				msgSpaceEvent: [spaceEventNew],
			};
		}

		default: {
			return { model };
		}
	}
};
const updateFromCmd: SpaceClientModule["update"] = ({ msgCmd, model, ctx }) => {
	switch (msgCmd?.t) {
		case "space/exit-game": {
			const currentUserId = ctx.currentUserId;
			const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(
				model,
				currentUserId,
			);
			if (!currentUserSpaceId || !currentUserId) {
				return { model };
			}
			return {
				model,
				msgSpaceEvent: [
					withId({
						t: "user-inputted-game",
						game: null,
						spaceId: currentUserSpaceId,
						userId: currentUserId,
					}),
				],
			};
		}

		default: {
			return { model };
		}
	}
};

const updateFromSpaceEvent: SpaceClientModule["update"] = (input) => {
	const { msgSpaceEvent, model, ctx } = input;

	switch (msgSpaceEvent?.t) {
		case "user-inputted-game": {
			if (!ctx.currentUserId) {
				return { model };
			}

			const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(
				model,
				ctx.currentUserId,
			);

			if (msgSpaceEvent.spaceId === currentUserSpaceId) {
				return {
					model,
					msgCmd: [
						playSound(
							msgSpaceEvent.game
								? APP_SOUND.navForwardMin
								: APP_SOUND.navBackwardMin,
						),
					],
				};
			}
			return { model };
		}

		default: {
			return { model };
		}
	}
};

const inputToSpaceId = (input: Parameters<SpaceClientModule["update"]>[0]) => {
	if (input.msg && "spaceId" in input.msg) {
		return input.msg.spaceId;
	}

	if (input.msgServer && "spaceId" in input.msgServer) {
		return input.msgServer.spaceId;
	}

	if (input.msgSpaceEvent && "spaceId" in input.msgSpaceEvent) {
		return input.msgSpaceEvent.spaceId;
	}

	return null;
};

const updateGame: SpaceClientModule["update"] = (input) => {
	if (!input.ctx.currentUserId || !input.ctx.currentUserRole) {
		return { model: input.model };
	}

	const spaceId = inputToSpaceId(input);

	if (!spaceId) {
		return { model: input.model };
	}

	const spaceState = SpacesCoreClient.toSpaceStarted(input.model, spaceId);

	if (!spaceState) {
		return { model: input.model };
	}

	const modelCore = spaceState.game;

	if (!modelCore) {
		return { model: input.model };
	}

	const modelGame = input.model.games[spaceId] ?? GameClient.init(modelCore.t);

	const gameUpdated = GameClient.update({
		ctx: {
			...input.ctx,
			space: spaceState,
			currentUserId: input.ctx.currentUserId,
			currentUserRole: input.ctx.currentUserRole,
		},
		model: modelGame,
		msgCore:
			input.msgSpaceEvent?.t === "game"
				? { ...input.msgSpaceEvent, ...input.msgSpaceEvent.c }
				: null,
		modelCore: modelCore,
		msgServer: input.msgServer?.t === "game" ? input.msgServer.c : null,
		msgCmd: null,
		msgEvt: input.msgEvt,
		msg: input.msg?.t === "game" ? input.msg.c : null,
	});

	const msgSpaceEventNew = (gameUpdated.msgCore ?? []).map(
		(c): WithEventId<SpaceCoreEvent> => {
			const eventId = c.eventId;
			// @ts-ignore
			c.eventId = undefined;
			return { eventId, spaceId, t: "game", c };
		},
	);

	return {
		model: {
			...input.model,
			games: {
				...input.model.games,
				[spaceId]: gameUpdated.model,
			},
		},
		msgCmd: SpaceClientCmd.map(
			gameUpdated.msgCmd ?? [],
			(c) => ({ t: "game", c, spaceId }),
			(c) => ({ t: "game", c, spaceId }),
		),
		eff: Eff.map(gameUpdated.eff, (c) => ({ t: "game", c, spaceId })),
		msgEvt: [],
		msgSpaceEvent: msgSpaceEventNew,
	};
};

//
//
//
//
//
//
//

const subscriptions: SpaceClientModule["subscriptions"] = (input) => {
	return subscriptionsCurrentUserGame(input);
};

const subscriptionsCurrentUserGame: SpaceClientModule["subscriptions"] = ({
	ctx,
	model,
}) => {
	if (!ctx.currentUserId || !ctx.currentUserRole) {
		return Sub.None;
	}

	const clientCtx: ClientCtx = {
		...ctx,
		currentUserId: ctx.currentUserId,
		currentUserRole: ctx.currentUserRole,
	};

	const spaceId = SpacesCoreClient.toSpaceIdByUserId(
		model,
		clientCtx.currentUserId,
	);

	if (!spaceId) {
		return Sub.None;
	}

	const spaceModel = model.spaces[spaceId];

	if (!spaceModel) {
		return Sub.None;
	}

	const spaceState = SpaceCore.toSpaceStarted(spaceModel);

	if (!spaceState) {
		return Sub.None;
	}

	const modelCore = spaceState.game;

	if (!modelCore) {
		return Sub.None;
	}

	const gameModel = model.games[spaceId] ?? GameClient.init(modelCore.t);

	const gameSub = GameClient.subscriptions({
		ctx: { ...clientCtx, space: spaceState },
		modelCore: modelCore,
		model: gameModel,
	});

	const sub = Sub.map(gameSub, (c): MsgClient => ({ t: "game", c, spaceId }));

	return sub;
};

//
//
//
//
//
//
//

const View: SpaceClientModule["View"] = (input) => {
	const { model, ctx, dispatch } = input;

	if (!ctx.space || !ctx.currentUserId || !ctx.currentUserRole) {
		return null;
	}

	const space = SpacesCoreClient.toSpaceStarted(model, ctx.space?.spaceId);

	if (!space) {
		return null;
	}

	if (space.game) {
		return (
			<GameClient.View
				modelCore={space.game}
				ctx={{
					...ctx,
					space,
					currentUserId: ctx.currentUserId,
					currentUserRole: ctx.currentUserRole,
				}}
				dispatch={(c) => dispatch({ t: "game", spaceId: space.spaceId, c })}
				model={model.games[ctx.space.spaceId] ?? GameClient.init(space.game.t)}
			/>
		);
	}

	return <ViewScreenNotInGame {...input} />;
};

const ViewScreenNotInGame: SpaceClientModule["View"] = (input) => {
	if (
		!input.ctx.space ||
		!input.ctx.currentUserId ||
		!input.ctx.currentUserRole
	) {
		return null;
	}

	if (input.ctx.space.hostId !== input.ctx.currentUserId) {
		return (
			<div className="flex h-full w-full flex-1 flex-col">
				<div className="w-full flex-1">
					<ViewUsersInSpaceList
						onOpenUserDetails={(userId) =>
							input.dispatch({ t: "clicked-user", userId })
						}
						ctx={{
							...input.ctx,
							space: input.ctx.space,
							currentUserId: input.ctx.currentUserId,
							currentUserRole: input.ctx.currentUserRole,
						}}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col">
			<TopBar
				ctx={input.ctx}
				center
				onBack={() => input.dispatch({ t: "clicked-go-home-button" })}
				title={input.ctx.t("spaces.games")}
			/>

			<div className="grid flex-1 grid-cols-3 justify-between gap-8 p-4">
				{gameNameList.map((gameName) => (
					<div key={gameName}>
						<button
							type="button"
							aria-label={gameName}
							onClick={() =>
								input.dispatch({ t: "clicked-game-tile", gameName })
							}
							className="flex overflow-hidden rounded-lg border border-neutral-700"
						>
							<CoverArt gameName={gameName} />
						</button>

						<Typography
							className="mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-semibold"
							variant="label"
							text={input.ctx.t(gameName)}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

//
//
//
//
//
//
//

export const SpaceGameClient = {
	View,
	update,
	subscriptions,
};
