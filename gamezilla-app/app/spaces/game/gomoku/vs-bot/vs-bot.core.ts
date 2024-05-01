import type { UserId } from "gamezilla-app/app/@shared/data";
import { Err, Ok, type Result } from "gamezilla-app/@shared/core";
import {
	type Board,
	type BotLevel,
	type MoveProblem,
	type Stone,
	initBoard,
	move,
	toBestMove,
	toOppositeStone,
	toTurn,
} from "../@shared/gomoku/gomoku";
import type { Position } from "../@shared/gomoku/gomoku-position";

//
//
//
// Model
//
//
//

export type Model = SetupModel | ModelSync;

export type SetupModel = {
	type: "setup";
	userId: UserId | null;
	userStone: Stone;
	botLevel: BotLevel;
};

export type ModelSync = {
	type: "game";
	userId: UserId;
	userStone: Stone;
	botLevel: BotLevel;
	board: Board;
};

export type ModelClient = Model;

export type ModelServer = Model;

export const initShared = ({ userId }: { userId: UserId | null }): Model => {
	return {
		type: "setup",
		userId,
		userStone: "white",
		botLevel: "Medium",
	};
};

//
//
//
// Msg
//
//
//

export type MsgClient = Req;

export type MsgServer = { t: "none" };

export type MsgToServer = Req;

export type MsgToClient =
	| Res
	| { t: "bot-moved"; result: Result<string, Model> };

//
//
//
//
//

export type Req =
	// setup
	| { t: "start-playing" }
	| { t: "stop-playing" }
	| { t: "inputted-user-stone"; userStone: Stone }
	| { t: "input-bot-level"; botLevel: BotLevel }
	| { t: "start-game" }
	// game
	| { t: "input-move"; position: Position }
	| { t: "stop-game" }
	| { t: "restart" }
	| { t: "swap-sides" };

export type Res = Req & { result: Result<Problem, Model> };

export type Problem =
	| "not-bot-turn"
	| "must-be-player"
	| "must-be-setup"
	| "must-be-no-player"
	| "must-be-game"
	| "no-position"
	| MoveProblem;

export const handle = ({
	ctx,
	msg,
	model,
}: {
	ctx: { currentUserId: UserId };
	msg: Req;
	model: Model;
}): Result<Problem, Model> => {
	switch (msg.t) {
		case "input-bot-level": {
			if (model.type !== "setup") {
				return Err("must-be-setup");
			}
			if (model.userId !== ctx.currentUserId) {
				return Err("must-be-player");
			}
			return Ok({
				...model,
				botLevel: msg.botLevel,
			});
		}

		case "inputted-user-stone": {
			if (model.type !== "setup") {
				return Err("must-be-setup");
			}
			if (model.userId !== ctx.currentUserId) {
				return Err("must-be-player");
			}
			return Ok({
				...model,
				userStone: msg.userStone,
			});
		}

		case "start-playing": {
			if (model.type !== "setup") {
				return Err("must-be-setup");
			}
			if (model.userId) {
				return Err("must-be-no-player");
			}
			return Ok({
				...model,
				userId: ctx.currentUserId,
			});
		}

		case "stop-playing": {
			if (model.type !== "setup") {
				return Err("must-be-setup");
			}
			if (model.userId !== ctx.currentUserId) {
				return Err("must-be-player");
			}
			return Ok({
				...model,
				userId: null,
			});
		}

		case "start-game": {
			if (model.type !== "setup") {
				return Err("must-be-setup");
			}
			if (model.userId !== ctx.currentUserId) {
				return Err("must-be-player");
			}
			return Ok({
				type: "game",
				board: initBoard,
				botLevel: model.botLevel,
				userId: model.userId,
				userStone: model.userStone,
				visual: {},
			});
		}

		case "input-move": {
			if (model.type !== "game") {
				return Err("must-be-game");
			}

			if (model.userId !== ctx.currentUserId) {
				return Err("must-be-player");
			}

			const moved = move({
				position: msg.position,
				stone: model.userStone,
				board: model.board,
			});

			if (moved.t === "err") {
				return moved;
			}

			return Ok({ ...model, board: moved.value });
		}

		case "stop-game": {
			if (model.type !== "game") {
				return Err("must-be-game");
			}
			if (model.userId !== ctx.currentUserId) {
				return Err("must-be-player");
			}
			return Ok({
				type: "setup",
				botLevel: model.botLevel,
				userId: model.userId,
				userStone: model.userStone,
			});
		}

		case "restart": {
			if (model.type !== "game") {
				return Err("must-be-game");
			}
			if (model.userId !== ctx.currentUserId) {
				return Err("must-be-player");
			}
			return Ok({
				...model,
				board: initBoard,
			});
		}

		case "swap-sides": {
			if (model.type !== "game") {
				return Err("must-be-game");
			}
			if (model.userId !== ctx.currentUserId) {
				return Err("must-be-player");
			}
			return Ok({
				...model,
				board: initBoard,
				userStone: toOppositeStone(model.userStone),
			});
		}
	}
};

export const handleBotMove = (model: Model): Result<Problem, Model> => {
	if (model.type !== "game") {
		return Err("must-be-game");
	}

	const isBotTurn = toTurn(model.board) === toOppositeStone(model.userStone);

	if (!isBotTurn) {
		return Err("not-bot-turn");
	}

	const botStone = toOppositeStone(model.userStone);

	const position = toBestMove({ stone: botStone, board: model.board });

	if (!position) {
		return Err("no-position");
	}

	const moved = move({ stone: botStone, position, board: model.board });

	if (moved.t === "err") {
		return moved;
	}

	const modelNew: Model = { ...model, board: moved.value };

	return Ok(modelNew);
};
