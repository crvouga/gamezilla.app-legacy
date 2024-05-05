import { GameMainMenu } from "gamezilla-app/app/spaces/game/@/game";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { withId } from "gamezilla-app/app/spaces/@/event";
import type {
	SpaceClientCtx,
	SpaceClientEvent,
} from "gamezilla-app/app/spaces/@/space";
import { APP_SOUND, ClientCmd, playSound } from "gamezilla-app/app/@/client";
import { IconGamepad, IconScrewdriverWrench } from "gamezilla-app/app/@/ui";
import { Sub } from "gamezilla-app/@/core";
import { SpaceClientCmd } from "../../@/space-client-cmd";
import { CreateClient } from "./create/create.client";
import { PlayClient } from "./play/play.client";
import { CoverArt } from "./@/flow-cover-art";
import type { FlowClientCtx } from "./@/flow-ctx";
import type {
	ModelClient,
	ModelCore,
	MsgClient,
	MsgCore,
	MsgToClient,
	MsgToServer,
} from "./flow.types";

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
	MsgOutCmd: SpaceClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>;
	MsgInEvent: SpaceClientEvent;
	MsgInCmd: null;
	MsgOutEvent: null;
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
				(msgCmd) => ClientCmd.tag("play", msgCmd),
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

		case "create": {
			const updated = CreateClient.update({
				ctx: { ...ctx, onQuit: () => {} },
				modelCore: modelCore.c,
				model: {
					...(model.t === "create" ? model.c : CreateClient.init),
					packs: model.packs,
					puzzles: model.puzzles,
				},
				msgCmd: msgCmd,
				msgEvt: msgEvt,
				msgServer: msgServer?.t === "create" ? msgServer.c : null,
				msgCore: msgCore?.t === "create" ? { ...msgCore, ...msgCore.c } : null,
				msg: msg?.t === "create" ? msg.c : null,
			});

			const tagged = GameClientModule.tagOutput(
				"create",
				(msgCmd) => SpaceClientCmd.tag("create", msgCmd),
				updated,
			);

			return {
				...tagged,
				model: {
					...tagged.model,
					t: "create",
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

				case "create": {
					return {
						model: {
							...model,
							t: "create",
							c: CreateClient.init,
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
		case "create": {
			return Sub.tag(
				"create",
				CreateClient.subscriptions({
					ctx: {
						...input.ctx,
						onQuit() {},
					},
					modelCore: input.modelCore.c,
					model: input.model.t === "create" ? input.model.c : CreateClient.init,
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
							title: "Create",
							description: "Create new puzzles and packs",
							onClick: () => {
								dispatch({
									t: "msgCore",
									c: {
										t: "user-changed-mode",
										mode: "create",
										userId: input.ctx.currentUserId,
									},
								});
							},
						},
					]}
				/>
			);
		}

		case "create": {
			return (
				<CreateClient.View
					ctx={ctx}
					dispatch={(c) => dispatch({ t: "create", c })}
					modelCore={modelCore.c}
					model={
						input.model.t === "create"
							? {
									...input.model.c,
									packs: input.model.packs,
									puzzles: input.model.puzzles,
								}
							: CreateClient.init
					}
				/>
			);
		}

		case "play": {
			return (
				<PlayClient.View
					ctx={ctx}
					dispatch={(c) => dispatch({ t: "play", c })}
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

		case "create": {
			switch (modelCore.t) {
				case "create": {
					return (
						<CreateClient.ViewFeedItem
							ctx={{ ...ctx, onQuit() {} }}
							dispatch={(c) => dispatch({ t: "create", c })}
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
