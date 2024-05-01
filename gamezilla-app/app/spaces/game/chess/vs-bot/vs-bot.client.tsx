import {
	type Eff,
	Sub,
	andThen,
	exhaustive,
	isErr,
	pipe,
} from "gamezilla-app/@shared/core";
import { type ClientCmd, sendToServer } from "gamezilla-app/app/@shared/client";
import {
	Avatar,
	IconArrowLeftOnRect,
	IconRobot,
	Spinner,
} from "gamezilla-app/app/@shared/ui";
import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@shared/space";
import {
	GameLayout,
	ViewBottomButtonBar,
	ViewBottomButtonBarAction,
} from "gamezilla-app/app/spaces/game/@shared/game";
import { VsBotSetup } from "gamezilla-app/app/spaces/game/@shared/vs-bot";
import { Chess } from "../@shared/chess";
import { Chessboard, CoverArt, PlayerIcon } from "../@shared/chess-ui";
import {
	type CoreModel,
	type ModelClient,
	type ModelServer,
	type MsgClient,
	type MsgToClient,
	type MsgToServer,
	initCore,
	isBotTurn,
	updateCore,
} from "./vs-bot.core";

//
//
//
// Model
//
//
//

export const init: ModelClient = {
	vsBotSetup: VsBotSetup.init,
	coreModel: initCore,
	openedMenuId: null,
	openedModal: null,
	isFlipped: false,
};

//
//
//
// Update
//
//
//

export const update = ({
	msg,
	model: modelPrev,
	ctx,
}: {
	ctx: SpaceClientCtx;
	msg: MsgClient;
	model: ModelClient;
}): {
	model: ModelClient;
	eff?: Eff<MsgClient>;
	msgCmd?: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>[];
} => {
	const model: ModelClient = { ...modelPrev, openedMenuId: null };

	switch (msg.t) {
		case "closed-modal": {
			return { model: { ...model, openedModal: null } };
		}

		case "clicked-flip": {
			return { model: { ...model, isFlipped: !model.isFlipped } };
		}

		case "opened-menu": {
			return { model: { ...model, openedMenuId: msg.menuId } };
		}

		case "closed-menu": {
			return { model: { ...model, openedMenuId: null } };
		}

		case "vs-bot-setup": {
			const updated = VsBotSetup.update(model.vsBotSetup, msg.c);
			return { model: { ...model, vsBotSetup: updated } };
		}

		default: {
			const handled = updateCore({
				ctx,
				msg,
				model: model.coreModel,
			});

			if (handled.t === "err") {
				return { model, msgCmd: [sendToServer(msg)] };
			}

			const coreModel = handled.value;

			const modelNew = mergeWithServer({
				client: model,
				server: coreModel,
			});

			return { model: modelNew, msgCmd: [sendToServer(msg)] };
		}
	}
};

export const updateFromServer = (input: {
	msg: MsgToClient;
	model: ModelClient;
}): {
	model: ModelClient;
	eff?: Eff<MsgClient>;
} => {
	return pipe(
		updateFromServerMain(input),
		andThen((model) => {
			if (
				input.model.coreModel.type !== "game-over" &&
				model.coreModel.type === "game-over"
			) {
				return {
					model: { ...model, openedModal: "game-over" },
				};
			}

			if (
				input.model.coreModel.type !== "game" &&
				model.coreModel.type === "game"
			) {
				return {
					model,
				};
			}

			return { model };
		}),
	);
};

const updateFromServerMain: typeof updateFromServer = ({ msg, model }) => {
	switch (msg.t) {
		case "bot-moved": {
			const { result } = msg;

			if (isErr(result)) {
				return { model };
			}

			const { didCapture, ...coreModel } = result.value;

			return { model: { ...model, coreModel } };
		}

		case "player-left": {
			const merged = mergeWithServer({
				client: model,
				server: msg.model,
			});
			return { model: merged };
		}

		case "input-move": {
			const { result } = msg;

			if (isErr(result)) {
				return { model };
			}

			const coreModelNew = result.value;

			const modelNew = mergeWithServer({
				client: model,
				server: coreModelNew,
			});

			return { model: modelNew };
		}

		default: {
			const { result } = msg;

			if (isErr(result)) {
				return { model };
			}

			const modelNew = mergeWithServer({
				client: model,
				server: result.value,
			});

			return { model: modelNew };
		}
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
	client = init,
	server,
}: {
	client?: ModelClient;
	server: ModelServer;
}): ModelClient => {
	return {
		isFlipped: client.isFlipped,
		openedMenuId: client.openedMenuId,
		openedModal: client.openedModal,
		coreModel: server,
		vsBotSetup: client.vsBotSetup,
	};
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: ModelClient): Sub<MsgClient> => {
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
	onClose,
}: {
	ctx: SpaceClientCtx;
	model: ModelClient;
	dispatch: (msg: MsgClient) => void;
	onClose: () => void;
}) => {
	if (model.coreModel.type === "setup") {
		return (
			<VsBotSetup.View
				model={model.vsBotSetup}
				dispatch={(c) => dispatch({ t: "vs-bot-setup", c })}
				title="Chess"
				renderCoverArt={(props) => {
					return <CoverArt {...props} />;
				}}
				bot={{
					label: Chess.botLevelToString(model.coreModel.botLevel),
					renderIcon: (props) =>
						Chess.renderBotLevel({
							level: model.coreModel.botLevel,
							...props,
						}),
				}}
				botVariants={Chess.allBotLevels.map((botLevel) => {
					return {
						label: Chess.botLevelToString(botLevel),
						renderIcon: (props) =>
							Chess.renderBotLevel({ level: botLevel, ...props }),
						onSelect: () => dispatch({ t: "input-bot-level", botLevel }),
					};
				})}
				onSwapSides={() =>
					dispatch({
						t: "start-playing",
						color: model.coreModel.userColor === "w" ? "b" : "w",
					})
				}
				canStartGame={model.coreModel.userId !== null}
				ctx={ctx}
				human={{
					player:
						model.coreModel.userColor === "b" ? "player-two" : "player-one",
					userId: model.coreModel.userId,
				}}
				onQuit={onClose}
				onStartGame={() => dispatch({ t: "start-game" })}
				playerOne={{
					label: "White",
					onStartPlaying: () => dispatch({ t: "start-playing", color: "w" }),
					onStopPlaying: () => dispatch({ t: "stop-playing" }),
					renderIcon: (props) => {
						return <PlayerIcon {...props} color="w" />;
					},
				}}
				playerTwo={{
					label: "Black",
					onStartPlaying: () => dispatch({ t: "start-playing", color: "b" }),
					onStopPlaying: () => dispatch({ t: "stop-playing" }),
					renderIcon: (props) => {
						return <PlayerIcon {...props} color="b" />;
					},
				}}
			/>
		);
	}

	const botSlot = (
		<div className="flex w-full items-center gap-3 p-3">
			<IconRobot className="h-10 w-10" />

			<p className="flex-1 text-lg">
				{Chess.botLevelToString(model.coreModel.botLevel)}
			</p>

			{isBotTurn(model.coreModel) && <Spinner className="h-10 w-10" />}
		</div>
	);

	const userSlot = (
		<div className="flex w-full items-center gap-3 p-3">
			<Avatar
				className="h-10 w-10"
				src={ctx.profiles[model.coreModel.userId]?.avatarUrl}
			/>

			<p className="flex-1 text-lg">
				{ctx.profiles[model.coreModel.userId]?.username}
			</p>
		</div>
	);

	const boardOrientation = model.isFlipped
		? Chess.toOppositeColor(model.coreModel.userColor)
		: model.coreModel.userColor;

	const topSlot =
		boardOrientation === model.coreModel.userColor ? botSlot : userSlot;

	const bottomSlot =
		boardOrientation === model.coreModel.userColor ? userSlot : botSlot;

	return (
		<GameLayout>
			<div className="flex w-full flex-1 flex-col items-center justify-center">
				{topSlot}

				<Chessboard
					id="chessboard"
					model={model.coreModel.board}
					orientation={boardOrientation}
					onPieceDrop={(move) => {
						const msg: MsgClient = {
							t: "input-move",
							move: {
								from: move.source,
								to: move.target,
								promotion: "q",
							},
						};

						dispatch(msg);

						// return result.t === "ok";
						return true;
					}}
				/>
				{bottomSlot}
			</div>
			<ViewBottomButtonBar>
				<ViewBottomButtonBarAction
					icon={(props) => <IconArrowLeftOnRect {...props} />}
					label="Exit"
					onClick={onClose}
				/>
			</ViewBottomButtonBar>
		</GameLayout>
	);
};

export const toGameText = (model: CoreModel): string => {
	switch (model.type) {
		case "game-over": {
			switch (model.gameOver.type) {
				case "Checkmate": {
					const color = Chess.colorToString(model.gameOver.winner);
					return `${color} won by checkmate`;
				}

				case "Stalemate": {
					return "Stalemate";
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
