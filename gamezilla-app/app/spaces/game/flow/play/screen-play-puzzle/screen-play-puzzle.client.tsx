import { TimeSpan } from "gamezilla-app/@/core";
import { APP_SOUND, playSound } from "gamezilla-app/app/@/client";
import {
	Button,
	Dialog,
	DialogHeader,
	DialogSurface,
	IconCheckmark,
	Transition,
} from "gamezilla-app/app/@/ui";
import { ButtionActions } from "gamezilla-app/app/@/ui/bottom-actions";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { ViewScreenTitle } from "../../../@/game/view-screen-title";
import { FlowVariantPlay } from "../../@/flow";
import { FlowPackPuzzlesGridClient } from "../../@/flow-pack/flow-pack-puzzles-grid/flow-pack-puzzles-grid.client";
import type { ClientModule } from "../play.types";
import * as CopyPuzzleClient from "./copy-puzzle/copy-puzzle.client";
import { LastPuzzleClient } from "./last-puzzle/last-puzzle.client";

const update: ClientModule["update"] = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		(model) => updateFromMsgCore({ ...input, model }),
		(model) => updateFromMsg({ ...input, model }),
		(model) => CopyPuzzleClient.update({ ...input, model }),
		(model) => LastPuzzleClient.update({ ...input, model }),
	);
};

const updateFromMsg: ClientModule["update"] = (input) => {
	switch (input.msg?.t) {
		case undefined:
		case "flow-pack-grid":
		case "flow-pack-list": {
			return { model: input.model };
		}
		default: {
			return {
				model: input.model,
				msgCore: [withId(input.msg)],
			};
		}
	}
};

const updateFromMsgCore: ClientModule["update"] = (input) => {
	switch (input.msgCore?.t) {
		case "user-clicked-open-pack-list-item": {
			return {
				model: input.model,
			};
		}

		case "user-clicked-reset-puzzle": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navTransitionLeft)],
			};
		}

		case "user-clicked-exit-puzzle": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navBackwardMin)],
			};
		}

		case "user-clicked-next-puzzle": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navForwardMin)],
			};
		}

		case "user-clicked-prev-puzzle": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navBackwardMin)],
			};
		}

		case "user-clicked-hint": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navForwardMin)],
			};
		}

		case "user-closed-puzzle-complete-dialog": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.navBackwardMin)],
			};
		}

		case "user-toggled-action-buttons-drawer": {
			return {
				model: input.model,
				msgCmd: [playSound(APP_SOUND.tap)],
			};
		}

		case "flow-variant-play": {
			if (input.modelCore.screen.t !== "screen-play-puzzle") {
				return { model: input.model };
			}

			const output = FlowVariantPlay.update({
				msg: input.msgCore.c,
				model: input.modelCore.screen.flowPlay,
				flowPuzzle: input.modelCore.screen.flowPuzzle,
			});

			if (!output.event) {
				return { model: input.model };
			}

			const soundSrc = FlowVariantPlay.eventToSoundSrc(output.event);

			return {
				model: input.model,
				msgCmd: [playSound(soundSrc)],
			};
		}
	}
	return {
		model: input.model,
	};
};

const View: ClientModule["View"] = (input) => {
	if (input.modelCore.screen.t !== "screen-play-puzzle") {
		return null;
	}
	const flowPuzzle = input.modelCore.screen.flowPuzzle;
	const flowPlay = input.modelCore.screen.flowPlay;
	const isSolved = input.modelCore.screen.state.t === "solved";
	const puzzleIndex = input.modelCore.screen.puzzleIndex;

	const prevPuzzleIndex = puzzleIndex - 1;
	const prevPuzzleId =
		input.modelCore.screen.flowPack.puzzleIds[prevPuzzleIndex];
	const prevPuzzle = prevPuzzleId
		? input.model.flowPuzzles[prevPuzzleId]
		: null;

	//
	const nextPuzzleIndex = puzzleIndex + 1;
	const nextPuzzleId =
		input.modelCore.screen.flowPack.puzzleIds[nextPuzzleIndex];
	const nextPuzzle = nextPuzzleId
		? input.model.flowPuzzles[nextPuzzleId]
		: null;

	const isLastPuzzle =
		input.modelCore.screen.puzzleIndex >=
		input.modelCore.screen.flowPack.puzzleIds.length - 1;

	const isSolvedPuzzleDialogOpen =
		input.modelCore.screen.state.t === "solved" &&
		input.modelCore.screen.opened === "puzzle-complete";

	const checkmarkDuration = TimeSpan.seconds(1 / 2);

	return (
		<>
			<FlowPackPuzzlesGridClient.ViewObserver
				dispatch={(c) => input.dispatch({ t: "flow-pack-grid", c })}
			/>
			<div
				className="flex w-full flex-1 flex-col overflow-y-scroll"
				data-puzzle-id={flowPuzzle.id}
			>
				<ViewScreenTitle title={`Level ${puzzleIndex + 1}`} />
				<div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
					<FlowVariantPlay.View
						key={flowPuzzle.id}
						flow={flowPuzzle.flow}
						dispatch={(c) => input.dispatch({ t: "flow-variant-play", c })}
						model={flowPlay}
					/>

					<CheckmarkAnimation
						open={isSolvedPuzzleDialogOpen}
						duration={checkmarkDuration}
					/>

					{isLastPuzzle ? (
						<LastPuzzleClient.View
							delay={checkmarkDuration}
							open={isSolvedPuzzleDialogOpen}
							ctx={input.ctx}
							dispatch={(c) => input.dispatch(c)}
						/>
					) : (
						<Dialog
							delay={checkmarkDuration}
							open={isSolvedPuzzleDialogOpen}
							onClose={() =>
								input.dispatch({ t: "user-closed-puzzle-complete-dialog" })
							}
						>
							<DialogSurface>
								<DialogHeader title={input.ctx.t("flow.puzzle-completed")} />
								{nextPuzzle && (
									<Button
										text={input.ctx.t("flow.next-puzzle")}
										onClick={() =>
											nextPuzzle &&
											input.dispatch({
												t: "user-clicked-next-puzzle",
												nextPuzzle,
												nextPuzzleIndex,
											})
										}
									/>
								)}
							</DialogSurface>
						</Dialog>
					)}
				</div>
				<ButtionActions.View
					id="screen-play-puzzle-bottom-bar"
					ctx={input.ctx}
					onToggle={() =>
						input.dispatch({ t: "user-toggled-action-buttons-drawer" })
					}
					open={input.modelCore.screen.opened === "action-drawer"}
					buttons={[
						ButtionActions.exit({
							...input,
							onClick: () => input.dispatch({ t: "user-clicked-exit-puzzle" }),
						}),

						ButtionActions.prev({
							...input,
							hidden: true,
							disabled: puzzleIndex === 0,
							onClick: () =>
								prevPuzzle
									? input.dispatch({
											t: "user-clicked-prev-puzzle",
											prevPuzzle,
											prevPuzzleIndex,
										})
									: null,
						}),

						isSolved
							? ButtionActions.next({
									...input,
									disabled:
										puzzleIndex >=
										input.modelCore.screen.flowPack.puzzleIds.length - 1,
									onClick: () =>
										nextPuzzle
											? input.dispatch({
													t: "user-clicked-next-puzzle",
													nextPuzzle,
													nextPuzzleIndex,
												})
											: null,
								})
							: ButtionActions.hint({
									...input,
									onClick: () =>
										input.dispatch({
											t: "flow-variant-play",
											c: { t: "user-clicked-hint" },
										}),
								}),

						ButtionActions.reset({
							...input,
							onClick: () => input.dispatch({ t: "user-clicked-reset-puzzle" }),
						}),

						CopyPuzzleClient.viewButtonAction(input),
					]}
				/>
			</div>
		</>
	);
};

const CheckmarkAnimation = (input: { open: boolean; duration: TimeSpan }) => {
	return (
		<Transition
			id="checkmark"
			onEnter={async (node) => {
				node.style.transition = "all 0.3s ease-in-out";
				node.style.opacity = "0";
				node.style.transform = "scale(0.8)";
				await new Promise((r) => setTimeout(r, 50));
				node.style.opacity = "1";
				node.style.transform = "scale(1)";
				await new Promise((r) =>
					setTimeout(r, TimeSpan.toMilliseconds(input.duration)),
				);
				node.style.opacity = "0";
				node.style.transform = "scale(0.8)";
			}}
			onExit={async () => {}}
			mode="out-in"
		>
			{input.open && (
				<div className="absolute inset-0 flex items-center justify-center opacity-0">
					<IconCheckmark className="aspect-square w-full opacity-50" />
				</div>
			)}
		</Transition>
	);
};

export const ScreenPuzzleClient = {
	View,
	update,
};
