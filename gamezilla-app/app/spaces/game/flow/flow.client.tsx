import { Sub } from "gamezilla-app/@/core";
import { APP_SOUND, playSound } from "gamezilla-app/app/@/client";
import { IconGamepad, IconScrewdriverWrench } from "gamezilla-app/app/@/ui";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import type {
	SpaceClientCtx,
	SpaceClientEvent,
} from "gamezilla-app/app/spaces/@/space";
import { GameMainMenu } from "gamezilla-app/app/spaces/game/@/game";
import { SpaceClientCmd } from "../../@/space-client-cmd";
import { CoverArt } from "./@/flow-cover-art";
import type { FlowClientCtx } from "./@/flow-ctx";
import { BuilderClient } from "./builder/builder.client";
import type {
	ModelClient,
	ModelCore,
	MsgClient,
	MsgCore,
	MsgToClient,
	MsgToServer,
} from "./flow.types";
import { PlayClient } from "./play/play.client";

//
//
//
//
//
//
//

type ClientModule = GameClientModule<{
	Model: ModelClient;
	Msg: MsgClient;
	//
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	//
	MsgCore: MsgCore;
	ModelCore: ModelCore;
	//
	Ctx: SpaceClientCtx;
	//
	MsgCmdOut: SpaceClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>;
	MsgEvtIn: SpaceClientEvent;
}>;

//
//
//
//
//
//

const init: ClientModule["init"] = {
	t: "none",
	flowPuzzles: {},
	flowPacks: {},
};

const update: ClientModule["update"] = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		(model) => GameMainMenu.update({ ...input, model }),
		(model) => updateFromMsg({ ...input, model }),
		(model) => updateFromMsgCore({ ...input, model }),
		(model) => updateChild({ ...input, model }),
	);
};

const updateChild: ClientModule["update"] = (input) => {
	switch (input.modelCore.t) {
		case null: {
			return { model: input.model };
		}

		case "play": {
			const updated = PlayClient.update({
				ctx: {
					...input.ctx,
					onQuit: () => {},
					flowPacks: input.model.flowPacks,
					flowPuzzles: input.model.flowPuzzles,
				},
				modelCore: input.modelCore.c,
				model: {
					...(input.model.t === "play" ? input.model.c : PlayClient.init),
				},
				msgCmd: null,
				msgEvt: input.msgEvt,
				msgServer: input.msgServer?.t === "play" ? input.msgServer.c : null,
				msgCore:
					input.msgCore?.t === "play"
						? { ...input.msgCore, ...input.msgCore.c }
						: null,
				msg: input.msg?.t === "play" ? input.msg.c : null,
			});

			const tagged = GameClientModule.tagOutput(
				"play",
				(msgCmd) => SpaceClientCmd.tag("play", msgCmd),
				updated,
			);

			return {
				...tagged,
				model: {
					...tagged.model,
					flowPuzzles: input.model.flowPuzzles,
					flowPacks: input.model.flowPacks,
				},
			};
		}

		case "builder": {
			const updated = BuilderClient.update({
				ctx: {
					...input.ctx,
					onQuit: () => {},
					flowPacks: input.model.flowPacks,
					flowPuzzles: input.model.flowPuzzles,
				},
				modelCore: input.modelCore.c,
				model: {
					...(input.model.t === "builder" ? input.model.c : BuilderClient.init),
					packs: input.model.flowPacks,
					puzzles: input.model.flowPuzzles,
				},
				msgCmd: null,
				msgEvt: input.msgEvt,
				msgServer: input.msgServer?.t === "builder" ? input.msgServer.c : null,
				msgCore:
					input.msgCore?.t === "builder"
						? { ...input.msgCore, ...input.msgCore.c }
						: null,
				msg: input.msg?.t === "builder" ? input.msg.c : null,
			});

			const tagged = GameClientModule.tagOutput(
				"builder",
				(msgCmd) => SpaceClientCmd.tag("builder", msgCmd),
				updated,
			);

			return {
				...tagged,
				model: {
					...tagged.model,
					t: "builder",
					c: {
						...tagged.model.c,
						packs: {},
						puzzles: {},
					},
					flowPacks: updated.model.packs,
					flowPuzzles: updated.model.puzzles,
				},
			};
		}
	}
};

const updateFromMsgCore: ClientModule["update"] = (input) => {
	const { msgCore, model } = input;

	switch (msgCore?.t) {
		case "user-changed-mode": {
			switch (msgCore.mode) {
				case "play": {
					return {
						model: { ...model, t: "play", c: PlayClient.init },
						msgCmd: [playSound(APP_SOUND.navForwardMin)],
					};
				}

				case "builder": {
					return {
						model: {
							...model,
							t: "builder",
							c: BuilderClient.init,
						},
						msgCmd: [playSound(APP_SOUND.navForwardMin)],
					};
				}

				case null: {
					return {
						model: { ...model, t: "none" },
						msgCmd: [playSound(APP_SOUND.navBackwardMin)],
					};
				}

				default: {
					return { model };
				}
			}
		}

		default: {
			return { model };
		}
	}
};

const updateFromMsg: ClientModule["update"] = (input) => {
	const { msg, model } = input;

	switch (msg?.t) {
		case "msgCore": {
			const msgCore = withId(msg.c);
			return {
				model,
				msgCore: [msgCore],
			};
		}

		default: {
			return { model };
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
//

const subscriptions: ClientModule["subscriptions"] = (input) => {
	switch (input.modelCore.t) {
		case "play": {
			return Sub.tag(
				"play",
				PlayClient.subscriptions({
					ctx: {
						...input.ctx,
						onQuit() {},
						flowPacks: input.model.flowPacks,
						flowPuzzles: input.model.flowPuzzles,
					},
					modelCore: input.modelCore.c,
					model: input.model.t === "play" ? input.model.c : PlayClient.init,
				}),
			);
		}
		case "builder": {
			return Sub.tag(
				"builder",
				BuilderClient.subscriptions({
					ctx: {
						...input.ctx,
						onQuit() {},
						flowPacks: input.model.flowPacks,
						flowPuzzles: input.model.flowPuzzles,
					},
					modelCore: input.modelCore.c,
					model:
						input.model.t === "builder" ? input.model.c : BuilderClient.init,
				}),
			);
		}

		default: {
			return Sub.None;
		}
	}
};

//
//
// View
//
//

const View: ClientModule["View"] = (input) => {
	const { modelCore, dispatch } = input;

	const ctx: FlowClientCtx = {
		...input.ctx,
		flowPacks: input.model.flowPacks,
		flowPuzzles: input.model.flowPuzzles,
		onQuit: () =>
			dispatch({
				t: "msgCore",
				c: {
					t: "user-changed-mode",
					mode: null,
					userId: input.ctx.currentUserId,
				},
			}),
	};

	switch (modelCore.t) {
		case null: {
			return (
				<GameMainMenu.View
					renderCoverArt={(input) => <CoverArt {...input} key={input.key} />}
					ctx={ctx}
					title={ctx.t("flow")}
					dispatch={dispatch}
					buttons={[
						{
							renderIcon: (input) => <IconGamepad {...input} />,
							title: ctx.t("flow.play"),
							description: ctx.t('flow.play-description'),
							onClick: () => {
								dispatch({
									t: "msgCore",
									c: {
										t: "user-changed-mode",
										mode: "play",
										userId: input.ctx.currentUserId,
									},
								});
							},
						},
						{
							renderIcon: (input) => <IconScrewdriverWrench {...input} />,
							title: ctx.t('flow.builder'),
							description: ctx.t('flow.builder-description'),
							onClick: () => {
								dispatch({
									t: "msgCore",
									c: {
										t: "user-changed-mode",
										mode: "builder",
										userId: input.ctx.currentUserId,
									},
								});
							},
						},
					]}
				/>
			);
		}

		case "builder": {
			return (
				<BuilderClient.View
					ctx={ctx}
					dispatch={(c) => dispatch({ t: "builder", c })}
					modelCore={modelCore.c}
					model={
						input.model.t === "builder"
							? {
									...input.model.c,
									packs: input.model.flowPacks,
									puzzles: input.model.flowPuzzles,
								}
							: BuilderClient.init
					}
				/>
			);
		}

		case "play": {
			return (
				<PlayClient.View
					ctx={ctx}
					dispatch={(c) => {
						dispatch({ t: "play", c });
					}}
					modelCore={modelCore.c}
					model={input.model.t === "play" ? input.model.c : PlayClient.init}
				/>
			);
		}
	}
};

const ViewFeedItem: ClientModule["ViewFeedItem"] = ({
	ctx,
	dispatch,
	modelCore,
	msgCore,
}) => {
	switch (msgCore.t) {
		case "play": {
			switch (modelCore.t) {
				case "play": {
					return (
						<PlayClient.ViewFeedItem
							ctx={{ ...ctx, onQuit() {}, flowPacks: {}, flowPuzzles: {} }}
							dispatch={(c) => dispatch({ t: "play", c })}
							modelCore={modelCore.c}
							msgCore={msgCore.c}
						/>
					);
				}
				default: {
					return null;
				}
			}
		}

		case "builder": {
			switch (modelCore.t) {
				case "builder": {
					return (
						<BuilderClient.ViewFeedItem
							ctx={{ ...ctx, onQuit() {}, flowPacks: {}, flowPuzzles: {} }}
							dispatch={(c) => dispatch({ t: "builder", c })}
							modelCore={modelCore.c}
							msgCore={msgCore.c}
						/>
					);
				}

				default: {
					return null;
				}
			}
		}

		default: {
			return null;
		}
	}
};

export const FlowClient: ClientModule = {
	init,
	subscriptions,
	update,
	View,
	ViewFeedItem,
};
