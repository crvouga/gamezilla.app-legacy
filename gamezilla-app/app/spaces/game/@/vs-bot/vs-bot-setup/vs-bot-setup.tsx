import type { VDom } from "gamezilla-app/@/vdom";
import type { UserId } from "gamezilla-app/app/@/data";
import {
	Avatar,
	Button,
	Drawer,
	IconQuestionMark,
	Typography,
} from "gamezilla-app/app/@/ui";
import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@/space";
import { ViewGameHeader } from "../../game/view-game-header";
import type { PlayerType, VsBotInput } from "../vs-bot";
import { TranslatedText } from "gamezilla-app/@/l18n";

//
//
//
// Model
//
//
//

type Opened = "change-bot";

export type Model = {
	opened: Opened | null;
};

export const init: Model = {
	opened: null,
};

//
//
//
// Msg
//
//
//

export type Msg = { t: "clicked-change-bot" } | { t: "closed-modal" };

export const update = (model: Model, msg: Msg): Model => {
	switch (msg.t) {
		case "clicked-change-bot": {
			return { ...model, opened: "change-bot" };
		}

		case "closed-modal": {
			return { ...model, opened: null };
		}
	}
};

//
//
//
// View
//
//
//

type PlayerProp =
	| {
			t: "user";
			userId: UserId | null;
			playerLabel: TranslatedText;
			renderIcon: (input: { className: string }) => VDom;
			onStartPlaying: () => void;
			onStopPlaying: () => void;
	  }
	| {
			t: "bot";

			botLabel: TranslatedText;
			renderBotIcon: (input: { className: string }) => VDom;
			playerLabel: TranslatedText;
			renderIcon: (input: { className: string }) => VDom;
			onStartPlaying: () => void;
			onStopPlaying: () => void;
	  };

export type VsBotSetupinput = VsBotInput & {
	human: {
		player: PlayerType;
		userId: UserId | null;
	};
	canStartGame: boolean;
};

type Input = VsBotSetupinput & { model: Model; dispatch: (m: Msg) => void };

export const View = ({
	dispatch,
	model,
	botVariants,
	title,
	renderCoverArt,
	onQuit,
	ctx,
	human,
	bot,
	playerOne,
	playerTwo,
	canStartGame,
	onStartGame,
	onSwapSides,
}: Input) => {
	const playerOneProp: PlayerProp =
		human.player === "player-one"
			? {
					...playerOne,
					t: "user",
					userId: human.userId,
					playerLabel: playerOne.label,
				}
			: {
					...playerOne,
					t: "bot",
					botLabel: bot.label,
					playerLabel: playerOne.label,
					renderBotIcon: bot.renderIcon,
				};

	const playerTwoProp: PlayerProp =
		human.player === "player-two"
			? {
					...playerTwo,
					t: "user",
					userId: human.userId,
					playerLabel: playerTwo.label,
				}
			: {
					...playerTwo,
					t: "bot",
					botLabel: bot.label,
					playerLabel: playerTwo.label,
					renderBotIcon: bot.renderIcon,
				};

	return (
		<div className="flex w-full flex-1 flex-col">
			<ViewGameHeader
				ctx={ctx}
				onBack={onQuit}
				renderCoverArt={renderCoverArt}
				title={title}
			/>

			<div className="flex w-full flex-col gap-2 p-4">
				<div className="grid w-full grid-cols-7">
					<PlayerIcons player={playerOneProp} ctx={ctx} />
					<div className="col-span-1 grid place-items-center">
						<Typography
							className=" flex h-full flex-1 flex-col items-center justify-center  text-3xl font-black"
							variant="title"
							text={ctx.t("game.vs")}
						/>
					</div>
					<PlayerIcons player={playerTwoProp} ctx={ctx} />
				</div>

				<div className="grid w-full grid-cols-7">
					<PlayerLabels player={playerOneProp} ctx={ctx} />
					<div className="col-span-1" />
					<PlayerLabels player={playerTwoProp} ctx={ctx} />
				</div>

				<div className="mt-2 grid w-full grid-cols-7">
					<PlayerButtons
						onSwapSides={onSwapSides}
						dispatch={dispatch}
						human={human}
						player={playerOneProp}
						ctx={ctx}
					/>
					<div className="col-span-1" />
					<PlayerButtons
						onSwapSides={onSwapSides}
						dispatch={dispatch}
						human={human}
						player={playerTwoProp}
						ctx={ctx}
					/>
				</div>
			</div>

			<div className="flex flex-1 items-center justify-center" />

			{ctx.currentUserId === ctx.space.hostId && (
				<div className="flex items-center gap-4 border-t border-neutral-700 p-4">
					<Button
						disabled={!canStartGame}
						variant="contained"
						color="primary"
						className="flex-1"
						onClick={onStartGame}
						text={ctx.t("game.start-game")}
					/>
				</div>
			)}

			<Drawer
				position="bottom"
				id="change-bot"
				open={model.opened === "change-bot"}
				onClose={() => dispatch({ t: "closed-modal" })}
			>
				<div className="flex flex-col pb-6">
					<Typography
						className="p-4 text-2xl font-bold"
						variant="title"
						text={ctx.t("game.change-bot")}
					/>
					<div>
						{botVariants.map((botLevel) => {
							const onClick = () => {
								botLevel.onSelect();
								dispatch({ t: "closed-modal" });
							};
							return (
								<button
									key={botLevel.label}
									className="flex w-full items-center gap-3 p-4 text-left text-xl font-bold"
									onClick={onClick}
								>
									{botLevel.renderIcon({
										className: "w-10 h-10",
									})}
									{botLevel.label}
								</button>
							);
						})}
					</div>
				</div>
			</Drawer>
		</div>
	);
};

const PlayerIcons = ({
	player,
	ctx,
}: {
	ctx: SpaceClientCtx;
	player: PlayerProp;
}) => {
	return (
		<div className="col-span-3 grid grid-cols-2 place-items-center">
			{player.t === "bot" ? (
				player.renderBotIcon({ className: "h-14 w-14" })
			) : player.userId ? (
				<Avatar
					className="h-14 w-14"
					src={ctx.profiles[player.userId]?.avatarUrl}
				/>
			) : (
				<div
					role="button"
					className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-neutral-800"
				>
					<IconQuestionMark className="h-10 w-10 text-neutral-300" />
				</div>
			)}
			{player.renderIcon({ className: "w-14 h-14" })}
		</div>
	);
};

const PlayerLabels = ({
	player,
	ctx,
}: {
	ctx: SpaceClientCtx;
	player: PlayerProp;
}) => {
	const profile =
		player.t === "user" && player.userId && ctx.profiles[player.userId]
			? ctx.profiles[player.userId]
			: null;
	return (
		<div className="col-span-3 grid grid-cols-2 place-items-center">
			<Typography
				variant="label"
				className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm text-neutral-300"
				text={
					player.t === "bot"
						? player.botLabel
						: profile
							? ctx.t("username", profile.username)
							: ctx.t("?")
				}
			/>
			<Typography
				variant="label"
				className="text-center text-sm text-neutral-300"
				text={player.playerLabel}
			/>
		</div>
	);
};

const PlayerButtons = ({
	human,
	player,
	ctx,
	onSwapSides,
	dispatch,
}: {
	onSwapSides: () => void;
	human: { userId: UserId | null };
	ctx: SpaceClientCtx;
	player: PlayerProp;
	dispatch: (m: Msg) => void;
}) => {
	return (
		<div className="col-span-3 flex flex-col gap-2">
			{!human.userId && (
				<Button
					onClick={player.onStartPlaying}
					className="w-full"
					color="primary"
					text={ctx.t("game.start-playing")}
				/>
			)}
			{player.t === "user" && ctx.currentUserId === player.userId && (
				<Button
					onClick={player.onStopPlaying}
					className="w-full"
					variant="text"
					color="primary"
					text={ctx.t("game.stop-playing")}
				/>
			)}
			{player.t === "bot" && human.userId === ctx.currentUserId && (
				<Button
					onClick={onSwapSides}
					className="w-full"
					variant="text"
					color="primary"
					text={ctx.t("game.swap-sides")}
				/>
			)}
			{player.t === "bot" && human.userId === ctx.currentUserId && (
				<Button
					onClick={() => dispatch({ t: "clicked-change-bot" })}
					className="w-full"
					variant="text"
					color="primary"
					text={ctx.t("game.change-bot")}
				/>
			)}
		</div>
	);
};
