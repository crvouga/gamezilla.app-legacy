import type { SpaceCtx } from "gamezilla-app/app/spaces/@shared/space";
import { UserId } from "gamezilla-app/app/@shared/data";
import { Posix } from "gamezilla-app/@shared/core";
import { p } from "gamezilla-app/@shared/core/parser";
import {
	type ColumnIndex,
	Columns,
	EMPTY_COLUMNS,
	MoveProblem,
	PlayerType,
	dropDisc,
	toStatus,
	toTurn,
} from "../@shared/connect-four/connect-four";

//
//
//
// Model
//
//
//

export type ModelClient = {
	openedModal: "confirm-resign" | null;
	ghostIndex: ColumnIndex | null;
};

export const ModelServer = p.l(null);
export type ModelServer = p.Infer<typeof ModelServer>;

//
//
//
// Msg
//
//
//

export type MsgServer = { t: null };

export type MsgClient =
	| MsgSync
	| { t: "hovered-over-columns"; columnIndex: ColumnIndex }
	| { t: "clicked-resign"; userId: UserId }
	| { t: "close-modal" };

export type MsgToServer = { t: null };

export type MsgToClient = { t: null };

//
//
//
//
//

const MoveTimeLimit = p.enumeration([5, 7, 9]);

const RematchResponse = p.enumeration(["Accept", "Decline"]);

export const MsgSync = p.or(
	p.obj({
		t: p.l("user-stopped-playing"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("user-started-playing"),
		userId: UserId,
		playerType: PlayerType,
	}),
	p.obj({
		t: p.l("user-inputted-move-time-limit"),
		userId: UserId,
		moveTimeLimit: MoveTimeLimit,
	}),
	p.obj({
		t: p.l("user-dropped-disc"),
		columnIndex: p.num,
		userId: UserId,
	}),
	p.obj({
		t: p.l("user-started-game"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("user-stopped-game"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("user-requested-rematch"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("user-responded-to-rematch-request"),
		userId: UserId,
		response: RematchResponse,
	}),
	p.obj({
		t: p.l("user-cancelled-rematch"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("user-resigned"),
		userId: UserId,
	}),
	p.obj({
		t: p.l("time-passed"),
		currentTime: Posix,
	}),
	p.obj({
		t: p.l("user-left"),
		userId: UserId,
	}),
);
export type MsgSync = p.Infer<typeof MsgSync>;

const GameOver = p.or(
	p.obj({
		type: p.l("Draw"),
	}),
	p.obj({
		type: p.l("Winner"),
		winner: PlayerType,
	}),
	p.obj({
		type: p.l("resignation"),
		resigner: PlayerType,
	}),
);
export type GameOver = p.Infer<typeof GameOver>;

const EventError = p.or(
	p.obj({
		t: p.l("not-playing"),
	}),
	p.obj({
		t: p.l("move"),
		c: MoveProblem,
	}),
);

type EventError = p.Infer<typeof EventError>;

const Rematch = p.or(
	p.obj({
		type: p.l("NotAsking"),
	}),
	p.obj({
		type: p.l("Asking"),
		asker: PlayerType,
	}),
);
export type Rematch = p.Infer<typeof Rematch>;

const Errors = p.obj({
	errors: p.dict(p.str, p.and(MsgSync, p.obj({ error: EventError }))),
});

type Errors = p.Infer<typeof Errors>;

const addError = (
	modelSync: ModelSync,
	msgSync: MsgSync,
	error: EventError,
): ModelSync => {
	return {
		...modelSync,
		errors: {
			...modelSync.errors,
			[JSON.stringify(msgSync)]: { ...msgSync, error },
		},
	};
};

export const StateSetup = p.and(
	Errors,
	p.obj({
		type: p.l("setup"),
		moveTimeLimit: MoveTimeLimit,
		players: p.partialDict(PlayerType, p.maybe(UserId)),
	}),
);
export type StateSetup = p.Infer<typeof StateSetup>;

export const StateGame = p.and(
	Errors,
	p.obj({
		type: p.l("game"),
		moveTimeLimit: MoveTimeLimit,
		columns: Columns,
		gameId: p.num,
		lastMoveAt: Posix,
		players: p.dict(PlayerType, UserId),
	}),
);
export type StateGame = p.Infer<typeof StateGame>;

export const StateGameOver = p.and(
	Errors,
	p.obj({
		type: p.l("game-over"),
		moveTimeLimit: MoveTimeLimit,
		columns: Columns,
		gameId: p.num,
		gameOver: GameOver,
		rematch: Rematch,
		players: p.dict(PlayerType, UserId),
	}),
);
export type StateGameOver = p.Infer<typeof StateGameOver>;

export const ModelSync = p.or(StateSetup, StateGame, StateGameOver);
export type ModelSync = p.Infer<typeof ModelSync>;

export const initSync = (ctx: SpaceCtx): ModelSync => {
	return {
		type: "setup",
		moveTimeLimit: 5,
		players: {
			"player-one": ctx.space.hostId,
			"player-two": null,
		},
		errors: {},
	};
};

export const toGameOver = (
	modelSync: ModelSync,
): GameOver | { type: "none" } => {
	if (modelSync.type === "setup") {
		return { type: "none" };
	}

	const status = toStatus(modelSync.columns);

	if (status.type === "Tie") {
		return { type: "Draw" };
	}

	if (status.type === "Winner") {
		return { type: "Winner", winner: status.winner };
	}

	return { type: "none" };
};

export type MoveTimeLimit = 5 | 7 | 9;

export const allMoveTimeLimit: {
	[moveTimeLimit in MoveTimeLimit]: MoveTimeLimit;
} = {
	"5": 5,
	"7": 7,
	"9": 9,
};

export const reducer = (modelSync: ModelSync, msgSync: MsgSync): ModelSync => {
	switch (modelSync.type) {
		case "setup": {
			switch (msgSync.t) {
				case "user-started-playing": {
					if (modelSync.players[msgSync.playerType] !== null) {
						return addError(modelSync, msgSync, {
							t: "not-playing",
						});
					}

					return {
						...modelSync,
						players: {
							...modelSync.players,
							[msgSync.playerType]: msgSync.userId,
						},
					};
				}

				case "user-stopped-playing": {
					const playerType = toPlayerType(msgSync.userId, modelSync);

					if (!playerType) {
						return addError(modelSync, msgSync, {
							t: "not-playing",
						});
					}

					return {
						...modelSync,
						players: {
							...modelSync.players,
							[playerType]: null,
						},
					};
				}

				case "user-inputted-move-time-limit": {
					return {
						...modelSync,
						moveTimeLimit: msgSync.moveTimeLimit,
					};
				}

				case "user-started-game": {
					const playerOne = modelSync.players["player-one"];
					const playerTwo = modelSync.players["player-two"];

					if (!playerOne || !playerTwo) {
						return addError(modelSync, msgSync, {
							t: "not-playing",
						});
					}

					return {
						errors: modelSync.errors,
						type: "game",
						columns: EMPTY_COLUMNS,
						moveTimeLimit: modelSync.moveTimeLimit,
						lastMoveAt: Posix.now(),
						gameId: 0,
						players: {
							"player-one": playerOne,
							"player-two": playerTwo,
						},
					};
				}

				default: {
					return modelSync;
				}
			}
		}

		case "game": {
			switch (msgSync.t) {
				case "user-dropped-disc": {
					const turn = toTurn(modelSync.columns);

					const dropped = dropDisc(
						modelSync.columns,
						msgSync.columnIndex,
						turn,
					);

					if (dropped.t === "err") {
						return addError(modelSync, msgSync, {
							t: "move",
							c: dropped.error,
						});
					}

					return {
						...modelSync,
						columns: dropped.value,
						// lastMoveAt: msgSync.happenedAt,
					};
				}

				case "user-resigned": {
					const resignedPlayer = toPlayerType(msgSync.userId, modelSync);

					if (!resignedPlayer) {
						return addError(modelSync, msgSync, {
							t: "not-playing",
						});
					}

					return {
						...modelSync,
						type: "game-over",
						gameOver: {
							type: "resignation",
							resigner: resignedPlayer,
						},
						rematch: { type: "NotAsking" },
					};
				}

				case "time-passed": {
					return modelSync;
				}
			}
			return modelSync;
		}

		case "game-over": {
			return modelSync;
		}
	}
};

export const toPlayerType = (
	userId: UserId,
	modelSync: ModelSync,
): PlayerType | null => {
	if (modelSync.players["player-one"] === userId) {
		return "player-one";
	}

	if (modelSync.players["player-two"] === userId) {
		return "player-two";
	}

	return null;
};
