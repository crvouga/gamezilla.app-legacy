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
	puzzles: {},
	packs: {},
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
	const { model, modelCore, msgEvt, ctx, msgCmd, msgCore, msgServer, msg } =
		input;

	switch (modelCore.t) {
		case null: {
			return { model };
		}

		case "play": {
			const updated = PlayClient.update({
				ctx: {
					...ctx,
					onQuit: () => {},
				},
				modelCore: modelCore.c,
				model: model.t === "play" ? model.c : PlayClient.init,
				msgCmd: msgCmd,
				msgEvt: msgEvt,
				msgServer: msgServer?.t === "play" ? msgServer.c : null,
				msgCore: msgCore?.t === "play" ? { ...msgCore, ...msgCore.c } : null,
				msg: msg?.t === "play" ? msg.c : null,
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
					puzzles: model.puzzles,
					packs: model.packs,
				},
			};
		}

		case "builder": {
			const updated = BuilderClient.update({
				ctx: { ...ctx, onQuit: () => {} },
				modelCore: modelCore.c,
				model: {
					...(model.t === "builder" ? model.c : BuilderClient.init),
					packs: model.packs,
					puzzles: model.puzzles,
				},
				msgCmd: msgCmd,
				msgEvt: msgEvt,
				msgServer: msgServer?.t === "builder" ? msgServer.c : null,
				msgCore: msgCore?.t === "builder" ? { ...msgCore, ...msgCore.c } : null,
				msg: msg?.t === "builder" ? msg.c : null,
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
					packs: updated.model.packs,
					puzzles: updated.model.puzzles,
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
					renderCoverArt={(props) => <CoverArt {...props} key={props.key} />}
					ctx={ctx}
					title="Flow"
					dispatch={dispatch}
					buttons={[
						{
							renderIcon: (props) => <IconGamepad {...props} />,
							title: "Play",
							description: "Start playing puzzles",
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
							renderIcon: (props) => <IconScrewdriverWrench {...props} />,
							title: "Builder",
							description: "Create and edit puzzles and packs",
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
									packs: input.model.packs,
									puzzles: input.model.puzzles,
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
							ctx={{ ...ctx, onQuit() {} }}
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
							ctx={{ ...ctx, onQuit() {} }}
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
