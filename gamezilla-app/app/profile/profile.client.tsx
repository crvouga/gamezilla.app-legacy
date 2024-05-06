import type { AppClientModule } from "gamezilla-app/app/@/architecture/app-client";
import {
	type AnonymousClientCtx,
	type ClientCmd,
	type ClientCtx,
	type ClientEvent,
	type ProfileCmd,
	back,
	logout,
	pushRoute,
	replaceRoute,
	sendToServer,
} from "gamezilla-app/app/@/client";
import { ProfileAvatar, type UserId } from "gamezilla-app/app/@/data";
import {
	Avatar,
	Button,
	IconChevronRight,
	TextField,
	TopBar,
	TopBarBackButton,
} from "gamezilla-app/app/@/ui";
import { Sub, isErr, loading } from "gamezilla-app/@/core";
import { ViewProfileScreen } from "./profile-client/profile-client-view-profile-screen";
import { ViewUpdateAvatarScreen } from "./profile-client/profile-client-view-update-avatar-screen";
import type {
	ModelClient,
	MsgClient,
	MsgToClient,
	MsgToServer,
} from "./profile.types";

//
//
//
//
//
//
//

type Ctx = ClientCtx | AnonymousClientCtx;

type ClientModule = AppClientModule<{
	Model: ModelClient;
	Msg: MsgClient;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	Ctx: Ctx;
	MsgCmdIn: ProfileCmd;
	MsgEvtIn: ClientEvent;
	MsgCmdOut: ClientCmd<{
		MsgClient: MsgClient;
		MsgToServer: MsgToServer;
	}>;
	MsgEvtOut: never;
	ViewSlot: {
		bottomBar: null;
	};
}>;

//
//
//
// Model
//
//
//

export const init: ClientModule["init"] = ({ ctx }) => {
	const initialModel: ModelClient = {
		profiles: {},
		requests: {},
		draft: {},
	};

	const model = initialModel;

	if (ctx.currentRoute.n === "profile" && ctx.currentRoute.t === "profile") {
		return loadProfile(ctx.currentRoute.userId, model);
	}

	return { model };
};

//
//
//
// Update
//
//
//

export const update: ClientModule["update"] = (input) => {
	if (input.msgEvt) {
		return updateFromEvent(input);
	}

	if (input.msg) {
		return updateFromMsg(input);
	}

	if (input.msgServer) {
		return updateFromServer(input);
	}

	if (input.msgCmd) {
		return updateFromCmd(input);
	}

	return { model: input.model };
};

const updateFromCmd: ClientModule["update"] = (input) => {
	const { model, msgCmd } = input;

	if (!msgCmd) {
		return { model };
	}

	switch (msgCmd.c.t) {
		case "add-profiles": {
			return {
				model: {
					...model,
					profiles: {
						...model.profiles,
						...msgCmd.c.profiles,
					},
				},
			};
		}
		case "open-profile": {
			return {
				model,
				msgCmd: [
					pushRoute({
						t: "profile",
						n: "profile",
						userId: msgCmd.c.userId,
					}),
				],
			};
		}
	}
};

const updateFromEvent: ClientModule["update"] = (input) => {
	const { msgEvt, model } = input;

	if (!msgEvt) {
		return { model };
	}

	switch (msgEvt.t) {
		case "routing/route-changed": {
			if (msgEvt.route.n === "profile" && msgEvt.route.t === "profile") {
				return loadProfile(msgEvt.route.userId, model);
			}
			return { model };
		}

		default: {
			return { model };
		}
	}
};

const updateFromServer: ClientModule["update"] = (input) => {
	const { model, msgServer } = input;

	if (!msgServer) {
		return { model };
	}

	switch (msgServer.t) {
		case "current-user-profile": {
			if (isErr(msgServer.result)) {
				return { model };
			}

			const profile = msgServer.result.value;

			const modelNew: ModelClient = {
				...model,
				profiles: {
					...model.profiles,
					[profile.userId]: profile,
				},
			};

			return {
				model: modelNew,
			};
		}
		default: {
			if (isErr(msgServer.result)) {
				return {
					model: {
						...model,
						requests: {
							...model.requests,
							[msgServer.t]: msgServer.result,
						},
					},
				};
			}

			const profilesNew = msgServer.result.value.reduce<
				ModelClient["profiles"]
			>((acc, profile) => {
				return {
					...acc,
					[profile.userId]: profile,
				};
			}, model.profiles);

			const modelNew: ModelClient = {
				...model,
				profiles: profilesNew,
			};

			return {
				model: modelNew,
			};
		}
	}
};

const updateFromMsg: ClientModule["update"] = (input) => {
	const { msg, model, ctx } = input;

	if (!msg) {
		return { model };
	}

	if (!ctx.currentUserId) {
		return { model };
	}

	switch (msg.t) {
		case "inputted-username": {
			return {
				model: {
					...model,
					draft: { ...model.draft, username: msg.username },
				},
			};
		}

		case "inputted-avatar-seed": {
			return {
				model: {
					...model,
					draft: {
						...model.draft,
						avatarSeed: ProfileAvatar.toSeed(msg.seed),
					},
				},
			};
		}

		case "inputted-avatar-style": {
			return {
				model: {
					...model,
					draft: { ...model.draft, avatarStyle: msg.style },
				},
			};
		}

		case "clicked-generate-random-seed": {
			return {
				model: {
					...model,
					draft: {
						...model.draft,
					},
				},
			};
		}

		case "clicked-back-button": {
			switch (msg.from.t) {
				case "profile": {
					return { model, msgCmd: [back()] };
				}

				case "profile-update": {
					return {
						model,
						msgCmd: [
							replaceRoute({
								n: "profile",
								t: "profile",
								userId: ctx.currentUserId,
							}),
						],
					};
				}

				case "profile-avatar": {
					return {
						model,
						msgCmd: [
							replaceRoute({
								n: "profile",
								t: "profile-edit",
							}),
						],
					};
				}

				case "profile-update-username": {
					return {
						model,
						msgCmd: [
							replaceRoute({
								n: "profile",
								t: "profile-edit",
							}),
						],
					};
				}
			}
		}

		case "clicked-logout-button": {
			return {
				model,
				msgCmd: [logout()],
			};
		}

		case "clicked-update-username-button": {
			return {
				model,
				msgCmd: [
					pushRoute(
						{
							n: "profile",
							t: "profile-edit-username",
						},
						true,
					),
				],
			};
		}

		case "clicked-edit-profile-button": {
			return {
				model,
				msgCmd: [
					pushRoute(
						{
							n: "profile",
							t: "profile-edit",
						},
						true,
					),
				],
			};
		}

		case "clicked-avatar":
		case "clicked-change-avatar-button": {
			return {
				model,
				msgCmd: [
					pushRoute(
						{
							n: "profile",
							t: "profile-edit-avatar",
						},
						true,
					),
				],
			};
		}

		default: {
			return {
				model: {
					...model,
					requests: {
						...model.requests,
						[msg.t]: { t: "loading" },
					},
				},
				toServer: [msg],
			};
		}
	}
};

const loadProfile = (
	userId: UserId,
	model: ModelClient,
): ReturnType<ClientModule["update"]> => {
	return {
		model: {
			...model,
			requests: { ...model.requests, "find-one": loading },
		},
		msgCmd: [sendToServer({ t: "find-one", userId })],
	};
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: ClientModule["subscriptions"] = (_input) => {
	return Sub.None;
};

//
//
//
// View
//
//
//

export const View: ClientModule["View"] = (props) => {
	switch (props.ctx.currentRoute.n) {
		case "profile": {
			switch (props.ctx.currentRoute.t) {
				case "profile": {
					return (
						<div className="relative flex h-full w-full flex-col">
							<ViewProfileScreen
								model={props.model}
								ctx={props.ctx}
								dispatch={props.dispatch}
								userId={props.ctx.currentRoute.userId}
							/>

							{props.slots?.bottomBar(null)}
						</div>
					);
				}

				case "profile-edit": {
					return <ViewUpdateScreen ctx={props.ctx} dispatch={props.dispatch} />;
				}

				case "profile-edit-avatar": {
					return (
						<ViewUpdateAvatarScreen
							model={props.model}
							dispatch={props.dispatch}
						/>
					);
				}

				case "profile-edit-username": {
					return (
						<ViewUpdateUsernameScreen
							ctx={props.ctx}
							model={props.model}
							dispatch={props.dispatch}
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

const ViewUpdateScreen = (input: {
	ctx: Ctx;
	dispatch: (m: MsgClient) => void;
}) => {
	if (!input.ctx.currentUserId) {
		return null;
	}

	const profile = input.ctx.profiles[input.ctx.currentUserId];

	return (
		<div className="flex h-full w-full flex-col items-center gap-4">
			<TopBar
				left={
					<TopBarBackButton
						onClick={() =>
							input.dispatch({
								t: "clicked-back-button",
								from: { t: "profile-update" },
							})
						}
					/>
				}
				title="Update Profile"
			/>

			<div className="flex w-full flex-col items-center gap-2 py-2">
				<Avatar
					src={profile?.avatarUrl}
					className="h-28 w-28"
					alt="profile avatar"
					onClick={() => input.dispatch({ t: "clicked-avatar" })}
				/>

				<Button
					size="sm"
					color="primary"
					variant="text"
					className="block"
					onClick={() => input.dispatch({ t: "clicked-change-avatar-button" })}
					text=" Change Avatar"
				/>
			</div>

			<ViewField
				onClick={() => input.dispatch({ t: "clicked-update-username-button" })}
				label="Username"
				value={profile?.username}
			/>
		</div>
	);
};

const ViewField = ({
	label,
	value,
	onClick,
}: {
	label: string;
	value?: string | null;
	onClick?: () => void;
}) => (
	<button
		onClick={onClick}
		className="flex w-full items-center justify-start px-4 py-2"
	>
		<div className="flex flex-1 flex-col items-start">
			<p className="text-sm text-neutral-300">{label}</p>
			{typeof value === "string" ? (
				<p className="h-7 text-lg">{value}</p>
			) : (
				<div className="flex h-7 w-full items-center ">
					<div className="h-4 w-1/2 animate-pulse rounded-lg bg-neutral-800"></div>
				</div>
			)}
		</div>

		<IconChevronRight className="h-6 w-6" />
	</button>
);

const ViewUpdateUsernameScreen = (input: {
	model: ModelClient;
	dispatch: (msg: MsgClient) => void;
	ctx: Ctx;
}) => {
	const currentUsername = input.ctx.currentUserId
		? input.model.profiles[input.ctx.currentUserId]?.username
		: null;

	const inputVal = input.model.draft?.username ?? currentUsername ?? "";
	return (
		<div className="flex h-full w-full flex-col">
			<TopBar
				left={
					<Button
						variant="text"
						color="primary"
						onClick={() =>
							input.dispatch({
								t: "clicked-back-button",
								from: { t: "profile-update-username" },
							})
						}
						text="Back"
					/>
				}
				title="Username"
				right={
					<Button
						variant="text"
						color="primary"
						onClick={() => {
							const username = input.model.draft?.username;
							if (username) {
								input.dispatch({ t: "change-username", username });
							}
						}}
						text="Done"
					/>
				}
			/>

			<div className="w-full p-4">
				<TextField
					label="Username"
					value={inputVal}
					id={"username"}
					onChange={(username) =>
						input.dispatch({ t: "inputted-username", username })
					}
				/>
			</div>
		</div>
	);
};
