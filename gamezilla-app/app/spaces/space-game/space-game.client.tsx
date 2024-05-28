import { APP_SOUND, playSound } from "gamezilla-app/app/@/client";
import { Button } from "gamezilla-app/app/@/ui";
import { Eff, Sub } from "gamezilla-app/@/core";
import { ViewGameHeader, ViewUsersInSpaceList } from "../game/@/game";
import { CoverArt } from "../game/game-cover-art";
import { GameClient } from "../game/game.client";
import { gameNameList, gameNameToString } from "../game/game.types";
import { type WithEventId, withId } from "../@/event";
import { SpaceClientCmd } from "../@/space-client-cmd";
import { SpaceClientModule } from "../architecture/architecture";
import { Space, type SpaceEvent, Spaces } from "../spaces-core";
import type { MsgClient } from "../spaces.types";

const update: SpaceClientModule["update"] = (input) => {
	return SpaceClientModule.andThen(
		{ model: input.model },
		//
		(model) => updateFromSpaceEvent({ ...input, model }),
		(model) => updateGame({ ...input, model }),
		(model) => updateFromMsg({ ...input, model }),
		(model) => updateFromCmd({ ...input, model }),
	);
};

const updateFromMsg: SpaceClientModule["update"] = ({ msg, model, ctx }) => {
	switch (msg?.t) {
		case "clicked-game-tile": {
			const currentUserId = ctx.currentUserId;

			const currentUserSpaceId = Spaces.toSpaceIdByUserId(model, currentUserId);

			if (!currentUserId || !currentUserSpaceId) {
				return { model };
			}

			const spaceEventNew = withId<SpaceEvent>({
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
			const currentUserSpaceId = Spaces.toSpaceIdByUserId(model, currentUserId);
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

			const currentUserSpaceId = Spaces.toSpaceIdByUserId(
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
	if (!input.ctx.currentUserId) {
		return { model: input.model };
	}

	const spaceId = inputToSpaceId(input);

	if (!spaceId) {
		return { model: input.model };
	}

	const spaceState = Spaces.toSpaceStarted(input.model, spaceId);

	if (!spaceState) {
		return { model: input.model };
	}

	const modelCore = spaceState.game;

	if (!modelCore) {
		return { model: input.model };
	}

	const msgSpaceEventWithMeta = input.msgSpaceEvent?.eventId
		? Spaces.toEventWithMeta(input.model, spaceId, input.msgSpaceEvent?.eventId)
		: null;

	const modelGame = input.model.games[spaceId] ?? GameClient.init(modelCore.t);

	const gameUpdated = GameClient.update({
		ctx: {
			...input.ctx,
			space: spaceState,
			currentUserId: input.ctx.currentUserId,
		},
		model: modelGame,
		msgCore:
			msgSpaceEventWithMeta?.t === "game"
				? { ...msgSpaceEventWithMeta, ...msgSpaceEventWithMeta.c }
				: null,
		modelCore: modelCore,
		msgServer: input.msgServer?.t === "game" ? input.msgServer.c : null,
		msgCmd: null,
		msgEvt: input.msgEvt,
		msg: input.msg?.t === "game" ? input.msg.c : null,
	});

	const msgSpaceEventNew = (gameUpdated.msgCore ?? []).map(
		(e): WithEventId<SpaceEvent> => ({ ...e, spaceId, t: "game", c: e }),
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
		eff: Eff.map((c) => ({ t: "game", c, spaceId }), gameUpdated.eff),
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
	const { currentUserId } = ctx;

	if (!currentUserId) {
		return Sub.None;
	}

	const clientCtx = { ...ctx, currentUserId };

	const spaceId = Spaces.toSpaceIdByUserId(model, currentUserId);

	if (!spaceId) {
		return Sub.None;
	}

	const spaceModel = model.spaces[spaceId];

	if (!spaceModel) {
		return Sub.None;
	}

	const spaceState = Space.toSpaceStarted(spaceModel);

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

	if (!ctx.space) {
		return <>Missing space</>;
	}

	if (!ctx.currentUserId) {
		return <>Missing current user id</>;
	}

	const space = Spaces.toSpaceStarted(model, ctx.space?.spaceId);

	if (!space) {
		return <>Space not started</>;
	}

	if (space.game) {
		return (
			<GameClient.View
				modelCore={space.game}
				ctx={{ ...ctx, space: space, currentUserId: ctx.currentUserId }}
				dispatch={(c) => dispatch({ t: "game", spaceId: space.spaceId, c })}
				model={model.games[ctx.space.spaceId] ?? GameClient.init(space.game.t)}
			/>
		);
	}

	return <ViewScreenNotInGame {...input} />;
};

const ViewScreenNotInGame: SpaceClientModule["View"] = ({ ctx, dispatch }) => {
	const { space, currentUserId } = ctx;
	if (!space || !currentUserId) {
		return null;
	}

	if (space.hostId !== ctx.currentUserId) {
		return (
			<div className="flex h-full w-full flex-1 flex-col">
				<ViewGameHeader />

				<div className="w-full flex-1">
					<ViewUsersInSpaceList
						onOpenUserDetails={(userId) =>
							dispatch({ t: "clicked-user", userId })
						}
						ctx={{
							...ctx,
							space,
							currentUserId,
						}}
					/>
				</div>

				<div className="flex w-full items-center justify-center border-t border-neutral-700 p-4">
					<Button
						className="w-full"
						onClick={() => dispatch({ t: "clicked-go-home-button" })}
						text="Go Home"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-1 flex-col">
			<h1 className="p-4 text-center text-3xl font-bold">Games</h1>

			<div className="grid flex-1 grid-cols-3 justify-between gap-8 px-4">
				{gameNameList.map((gameName) => (
					<div key={gameName}>
						<button
							aria-label={gameName}
							onClick={() => dispatch({ t: "clicked-game-tile", gameName })}
							className="flex overflow-hidden rounded-lg border border-neutral-700"
						>
							<CoverArt gameName={gameName} />
						</button>

						<p className="mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-semibold">
							{gameNameToString(gameName)}
						</p>
					</div>
				))}
			</div>

			<div className="flex w-full items-center justify-center border-t border-neutral-700 p-4">
				<Button
					className="w-full"
					onClick={() => dispatch({ t: "clicked-go-home-button" })}
					text="Go Home"
				/>
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
