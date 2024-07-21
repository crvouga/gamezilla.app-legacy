import { Eff, Option, Sub, exhaustive, isErr } from "gamezilla-app/@/core";
import type { ClientCtx } from "gamezilla-app/app/@/client";
import type { UserId } from "gamezilla-app/app/@/data";
import { Button, IconArrowLeftOnRect } from "gamezilla-app/app/@/ui";
import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@/space";
import { Chess } from "../@/chess";
import {
	type CoreModel,
	type ModelClient,
	type ModelServer,
	type MsgClient,
	type MsgToClient,
	initCore,
} from "./vs-user.types";

//
//
//
// Model
//
//
//

export type Model = ModelClient;

export const init = ({
	userId,
}: {
	userId?: UserId | null;
}): {
	model: ModelClient;
} => {
	return {
		model: {
			coreModel: initCore({ userId: userId ?? "none" }),
			openedMenuId: Option.None,
			openedModal: "none",
			isFlipped: false,
		},
	};
};

//
//
//
// Update
//
//
//

export type Msg = MsgClient;

export const update = (
	msg: Msg,
	model: Model,
): { model: Model; eff?: Eff<Msg> } => {
	switch (msg[0]) {
		//
		//
		// MsgClient
		//
		//

		case "OpenedMenu": {
			return { model: { ...model, openedMenuId: Option.Some(msg[1]) } };
		}

		case "ClosedMenu": {
			return { model: { ...model, openedMenuId: Option.None } };
		}

		case "ClickedFlip": {
			return { model: { ...model, isFlipped: !model.isFlipped } };
		}

		case "OpenedModal": {
			return { model: { ...model, openedModal: msg[1] } };
		}

		case "ClosedModal": {
			return { model: { ...model, openedModal: "none" } };
		}

		//
		//
		//
		// MsgToServer
		//
		//
		//

		default: {
			return { model };
		}
	}
};

export const updateFromServer = (
	{ ctx }: { ctx: SpaceClientCtx },
	msg: MsgToClient,
	_model: Model,
): [Model, Eff<Msg>] => {
	const model: Model = { ..._model, openedMenuId: Option.None };

	switch (msg[0]) {
		case "InputClock_Done": {
			if (msg[1].t === "err") {
				return [model, Eff.None];
			}
			return [{ ...model, coreModel: msg[1].value }, Eff.None];
		}

		case "input-move-done": {
			if (msg[1].t === "err") {
				return [model, Eff.None];
			}

			const coreModelNew = msg[1].value;

			if (coreModelNew.type !== "game") {
				return [model, Eff.None];
			}

			return [{ ...model, coreModel: coreModelNew }, Eff.None];
		}

		case "InputPlayer_Done": {
			if (msg[1].t === "err") {
				return [model, Eff.None];
			}

			const coreModel = msg[1].value;

			return [{ ...model, coreModel }, Eff.None];
		}

		case "StartGame_Done": {
			if (msg[1].t === "err") {
				return [model, Eff.None];
			}

			const coreModel = msg[1].value;

			return [{ ...model, coreModel }, Eff.None];
		}

		//
		//
		// Draw
		//
		//

		case "RequestToDraw_Done": {
			switch (msg[1].t) {
				case "err": {
					return [model, Eff.None];
				}

				case "ok": {
					return [{ ...model, openedModal: "AskedToDraw" }, Eff.None];
				}

				default: {
					return [model, Eff.None];
				}
			}
		}

		case "RespondToDraw_Done": {
			if (msg[1].t === "err") {
				return [model, Eff.None];
			}

			const coreModel = msg[1].value;

			if (coreModel.type === "game-over") {
				return [{ ...model, coreModel }, Eff.None];
			}

			const isNotPlaying =
				coreModel.type === "game" &&
				coreModel.w !== ctx.currentUserId &&
				coreModel.b !== ctx.currentUserId;

			if (isNotPlaying) {
				return [{ ...model, coreModel }, Eff.None];
			}

			return [{ ...model, coreModel }, Eff.None];
		}

		case "CancelDraw_Done": {
			const result = msg[1];

			if (isErr(result)) {
				return [model, Eff.None];
			}

			const coreModel = result.value;

			const isNotPlaying =
				coreModel.type === "game" &&
				coreModel.w !== ctx.currentUserId &&
				coreModel.b !== ctx.currentUserId;

			if (isNotPlaying) {
				return [{ ...model, coreModel }, Eff.None];
			}

			return [{ ...model, coreModel }, Eff.None];
		}

		//
		//
		//
		//
		//

		case "resign_Done": {
			if (msg[1].t === "err") {
				return [model, Eff.None];
			}

			const coreModelNew = msg[1].value;

			if (coreModelNew.type === "setup") {
				return [model, Eff.None];
			}

			return [{ ...model, coreModel: coreModelNew }, Eff.None];
		}

		case "NewGame_Done": {
			if (msg[1].t === "err") {
				return [model, Eff.None];
			}

			const coreModelNew = msg[1].value;

			return [{ ...model, coreModel: coreModelNew }, Eff.None];
		}

		case "game-over": {
			return [
				{
					...model,
					openedModal: "game-over",
				},
				Eff.None,
			];
		}

		case "GameStarted": {
			return [model, Eff.None];
		}

		case "ClockTicked": {
			const coreModel = msg[1];

			return [{ ...model, coreModel }, Eff.None];
		}

		case "player-left": {
			return [{ ...model, coreModel: msg[1] }, Eff.None];
		}

		default: {
			return exhaustive(msg[0]);
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

export const subscriptions = (_model: Model): Sub<Msg> => {
	return Sub.None;
};

//
//
//
// View
//
//
//

export const View = ({
	ctx,
	model,
	dispatch,
	onQuit,
}: {
	ctx: ClientCtx;
	model: Model;
	dispatch: (msg: Msg) => void;
	onQuit: () => void;
}) => {
	if (model.coreModel.type === "setup") {
		return (
			<div>
				<div className="flex-1" />
				<div className="flex items-center gap-4 border-t border-neutral-700 p-4">
					<Button
						className="flex-1"
						onClick={onQuit}
						start={<IconArrowLeftOnRect className="h-6 w-6" />}
						text={ctx.t("app.exit")}
					/>
					<Button
						variant="contained"
						color="primary"
						className="flex-1"
						text={ctx.t('game.start-game')}
					/>
				</div>
			</div>
		);
	}

	// const { w, b } = model.coreModel;

	// const currentUserColor: Chess.Color | "none" | "Both" =
	//   ctx.currentUserId === w && ctx.currentUserId === b
	//     ? "Both"
	//     : ctx.currentUserId === w
	//     ? "w"
	//     : ctx.currentUserId === b
	//     ? "b"
	//     : "none";

	// const boardOrientation: Chess.Color = p(
	//   currentUserColor === "none" || currentUserColor === "Both"
	//     ? "w"
	//     : currentUserColor,
	//   (color) => (model.isFlipped ? Chess.toOppositeColor(color) : color)
	// );

	return (
		<div>
			{/* <Chessboard
        model={board}
        boardOrientation={boardOrientation}
        isDraggablePiece={({ piece }) => {
          return (
            Chess.toColor(piece) === currentUserColor ||
            currentUserColor === "Both"
          );
        }}
        onPieceDrop={(moveInput) => {
          const msg: InputMove = [
            "input-move",
            {
              userId: ctx.currentUserId,
              ...moveInput,
            },
          ];

          dispatch(msg);

          const inputted = inputMove(msg[1], model.coreModel);

          return inputted.t === "ok";
        }}
      /> */}

			<div className="flex-1" />

			<ViewGameOverDialog model={model} dispatch={dispatch} />
		</div>
	);
};

const ViewGameOverDialog = ({
	model,
}: {
	model: Model;
	dispatch: (msg: Msg) => void;
}) => {
	if (model.coreModel.type === "setup") {
		return <span>{toGameText(model.coreModel)}</span>;
	}

	if (model.coreModel.type === "game") {
		return <span />;
	}

	return <span />;
};

const toGameText = (model: CoreModel): string => {
	switch (model.type) {
		case "game-over": {
			switch (model.gameOver.type) {
				case "Checkmate": {
					const colorStr = Chess.colorToString(model.gameOver.winner);
					return `${colorStr} won by checkmate`;
				}

				case "DrawByAgreement": {
					return "Drawn by agreement";
				}

				case "resignation": {
					return `${Chess.colorToString(model.gameOver.resigner)} resigned`;
				}

				case "Stalemate": {
					return "Stalemate";
				}

				case "WinOnTime": {
					return `${Chess.colorToString(model.gameOver.winner)} won on time`;
				}

				default:
					return exhaustive(model.gameOver);
			}
		}

		case "setup": {
			return "Setting up game";
		}

		case "game": {
			if (Chess.inCheck(model.board)) {
				return `${Chess.colorToString(Chess.toTurn(model.board))} is in check`;
			}

			return `${Chess.colorToString(Chess.toTurn(model.board))}'s turn`;
		}

		default:
			return exhaustive(model);
	}
};

//
//
//
//
//
//
//

export const mergeWithServer = ({
	client,
	server,
}: {
	client?: ModelClient;
	server: ModelServer;
}): ModelClient => {
	const initial = init({ userId: null });
	const clientModel = client ?? initial.model;
	return {
		isFlipped: clientModel.isFlipped,
		openedMenuId: clientModel.openedMenuId,
		openedModal: clientModel.openedModal,
		coreModel: server,
	};
};
