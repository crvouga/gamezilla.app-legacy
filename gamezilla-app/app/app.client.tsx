import {
	Browser,
	Eff,
	Posix,
	Sub,
	batchMsgs,
	eq,
	toMsgType,
} from "gamezilla-app/@/core";
import { LanguageCodeISO_639_1 } from "gamezilla-app/@/l18n";
import type { Route } from "gamezilla-app/@/routing/generated/routes";
import type { VDom } from "gamezilla-app/@/vdom";
import {
	APP_SOUND,
	type AnonymousClientCtx,
	ClientCmd,
	type ClientCtx,
	type ClientEvent,
	isAnonymous,
	preloadSound,
} from "gamezilla-app/app/@/client";
import {
	IconGamepad,
	IconUserCircle,
	LoadingState,
	Portal,
	cn,
} from "gamezilla-app/app/@/ui";
import { getTranslator } from "./@/client/translator";
import { IntersectionObserverEmitter } from "./@/ui/intersection-observer";
import { Platform, Routing, Sound, StatusBar, Toast } from "./app-client";
import type {
	ModelClient,
	MsgClient,
	MsgToClient,
	MsgToServer,
} from "./app.types";
import * as AuthClient from "./auth/auth.client";
import * as LangClient from "./lang/lang.client";
import * as ProfileClient from "./profile/profile.client";
import * as SpaceClient from "./spaces/spaces.client";
import {
	ClientTransport,
	type IClientTransport,
} from "./wire/transport-client";
import * as Wire from "./wire/wire.client";
import { ServerImpl } from "public-config";

export type Model = ModelClient;

export type Msg = MsgClient;

//
//
//
// Transport
//
//
//

export type Deps = {
	transport: IClientTransport<{
		MsgToServer: MsgToServer;
		MsgToClient: MsgToClient;
	}>;
	stored: Record<string, unknown>;
};

export const getDeps = async ({
	serverUrl,
	codebaseVersionId,
	serverImpl,
}: {
	serverImpl: ServerImpl;
	serverUrl: string;
	codebaseVersionId: string;
}): Promise<Deps> => {
	const transport = await ClientTransport<MsgToServer, MsgToClient>({
		impl:
			serverImpl === "node"
				? {
						t: "socket-io",
						serverUrl,
					}
				: {
						t: "web-sockets",
						serverUrl,
					},
		codebaseVersionId,
	});

	const stored = getStored();

	return {
		transport,
		stored,
	};
};

const getStored = () => {
	if (typeof window === "undefined") {
		return {};
	}

	const stored: Record<string, unknown> = {};

	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (!key) {
			continue;
		}
		const value = localStorage.getItem(key);
		try {
			stored[key] = value ? JSON.parse(value) : value;
		} catch (error) {
			stored[key] = value;
		}
	}

	return stored;
};

//
//
//
//
// Model
//
//
//
//

export type Ctx = {
	now: Posix;
	location: Browser.Location;
	navigatorLanguage: LanguageCodeISO_639_1;
};

export const getCtx = (): Ctx => {
	return {
		now: Posix.now(),
		location: Browser.location(),
		navigatorLanguage: LanguageCodeISO_639_1.getLangFromNavigator() ?? "en",
	};
};

export const init = (input: {
	deps: Deps;
	ctx: Ctx;
}): {
	model: ModelClient;
	eff?: Eff<MsgClient>;
} => {
	const routing = Routing.init({
		location: input.ctx.location,
	});

	const ctx: AnonymousClientCtx = {
		...input.ctx,
		currentRoute: routing.model.currentRoute,
		t: getTranslator(input.ctx.navigatorLanguage),
		currentUserId: null,
		documentVisibilityState: "visible",
		profiles: {},
	};

	const lang = LangClient.init({
		ctx,
		stored: input.deps.stored,
	});

	const toast = Toast.init({
		stored: input.deps.stored,
		ctx,
	});

	const wire = Wire.init({
		stored: input.deps.stored,
	});

	const auth = AuthClient.init({
		stored: input.deps.stored,
		ctx,
	});

	const space = SpaceClient.init({
		ctx,
		stored: input.deps.stored,
	});

	const profile = ProfileClient.init({
		ctx,
		stored: input.deps.stored,
	});

	const sound = Sound.init({
		ctx: null,
		stored: input.deps.stored,
	});

	const platform = Platform.init({
		stored: input.deps.stored,
	});

	const statusBar = StatusBar.init({
		stored: input.deps.stored,
	});

	const initialModel: ModelClient = {
		statusBar: statusBar.model,
		routing: routing.model,
		toast: toast.model,
		wire: wire.model,
		sound: sound.model,
		platform: platform.model,
		spaces: space.model,
		auth: auth.model,
		profile: profile.model,
		lang: lang.model,
	};

	const initialEff = Eff.batch<MsgClient>([
		routing.eff,
		Eff.tag("auth", auth.eff),
		Eff.tag("lang", lang.eff),
	]);

	const initialCmd = batchMsgs<
		ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
	>(
		ClientCmd.tag("spaces", space.msgCmd),
		ClientCmd.tag("profile", profile.msgCmd),
		ClientCmd.tag("auth", auth.msgCmd),
		ClientCmd.tag("lang", lang.msgCmd),
		preloadSound(Object.values(APP_SOUND)),
	);

	const updated = updateLoop(input.deps, input.ctx, {
		model: initialModel,
		eff: initialEff,
		msgCmd: initialCmd,
		msgEvt: [],
	});

	return {
		model: updated.model,
		eff: updated.eff,
	};
};

//
//
//
// Update
//
//
//

const SHOULD_LOG = false;

const log = (...msg: unknown[]) => {
	if (SHOULD_LOG) {
		console.log(...msg);
	}
};

export const update = (input: {
	ctx: Ctx;
	msg: MsgClient;
	model: ModelClient;
	deps: Deps;
}): {
	model: ModelClient;
	eff?: Eff<MsgClient>;
} => {
	if (input.msg) {
		log("[msg]", toMsgType(input.msg));
	}
	const msgServer = input.msg.t === "→" ? input.msg.c : undefined;
	if (msgServer) {
		log("[➡️]", toMsgType(msgServer));
	}
	const updatedFromMsg = updateChild({
		ctx: input.ctx,
		model: input.model,
		msg: input.msg,
		msgServer: msgServer,
		deps: input.deps,
	});

	const updated = updateLoop(input.deps, input.ctx, updatedFromMsg);

	return updated;
};

type Output = {
	model: ModelClient;
	eff: Eff<MsgClient>;
	msgEvt: ClientEvent[];
	msgCmd: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>[];
};

const updateLoop = (deps: Deps, ctx: Ctx, acc: Output): Output => {
	const [msgCmd, ...msgCmdRest] = acc.msgCmd;

	if (msgCmd) {
		log("[msgCmd]", toMsgType(msgCmd));
		const updatedCmd = updateChild({
			deps,
			ctx,
			model: acc.model,
			msgCmd,
		});
		return updateLoop(deps, ctx, {
			model: updatedCmd.model,
			msgCmd: [...msgCmdRest, ...updatedCmd.msgCmd],
			eff: Eff.batch([acc.eff, updatedCmd.eff]),
			msgEvt: batchMsgs(acc.msgEvt, updatedCmd.msgEvt),
		});
	}

	const [msgEvt, ...msgEvtRest] = acc.msgEvt;

	if (msgEvt) {
		log("[msgEvt]", toMsgType(msgEvt));
		const updatedEvent = updateChild({
			deps,
			ctx,
			model: acc.model,
			msgEvt,
		});
		return updateLoop(deps, ctx, {
			model: updatedEvent.model,
			msgCmd: [...msgCmdRest, ...updatedEvent.msgCmd],
			eff: Eff.batch([acc.eff, updatedEvent.eff]),
			msgEvt: batchMsgs(msgEvtRest, updatedEvent.msgEvt),
		});
	}

	return acc;
};

const updateChild = ({
	ctx,
	model,
	msg,
	msgServer,
	msgEvt,
	msgCmd,
	deps,
}: {
	deps: Deps;
	ctx: Ctx;
	model: ModelClient;
	msg?: MsgClient;
	msgServer?: MsgToClient;
	msgEvt?: ClientEvent;
	msgCmd?: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>;
}): Output => {
	const clientClient = toClientCtx({ model, ctx });

	const space = SpaceClient.update({
		ctx: clientClient,
		model: model.spaces,
		msg: msg?.t === "spaces" ? msg.c : null,
		msgServer: msgServer?.t === "spaces" ? msgServer.c : null,
		msgEvt: msgEvt,
		msgCmd: null,
	});

	const profile = ProfileClient.update({
		ctx: clientClient,
		model: model.profile,
		msg: msg?.t === "profile" ? msg.c : null,
		msgServer: msgServer?.t === "profile" ? msgServer.c : null,
		msgEvt: msgEvt,
		msgCmd: msgCmd?.t === "profile" ? msgCmd : null,
	});

	const auth = AuthClient.update({
		ctx: clientClient,
		model: model.auth,
		msg: msg?.t === "auth" ? msg.c : null,
		msgServer: msgServer?.t === "auth" ? msgServer.c : null,
		msgEvt: msgEvt,
		msgCmd: msgCmd?.t === "auth" ? msgCmd : null,
	});

	const routing = Routing.update({
		model: model.routing,
		msg: msg?.t === "routing" ? msg.c : null,
		msgCmd: msgCmd?.t === "routing" ? msgCmd : null,
	});

	const wire = Wire.update({
		model: model.wire,
		msg: msg?.t === "wire" ? msg.c : null,
		msgServer: msgServer?.t === "wire" ? msgServer.c : null,
		msgCmd: msgCmd?.t === "wire" ? msgCmd : null,
		transport: deps.transport,
	});

	const sound = Sound.update({
		model: model.sound,
		msg: msg?.t === "sound" ? msg.c : null,
		msgCmd: msgCmd?.t === "sound" ? msgCmd : null,
		ctx: null,
	});

	const platform = Platform.update({
		model: model.platform,
		msg: msg?.t === "platform" ? msg.c : null,
		msgCmd: msgCmd?.t === "platform" ? msgCmd : null,
	});

	const statusBar = StatusBar.update({
		model: model.statusBar,
		msg: msg?.t === "status-bar" ? msg.c : null,
		msgCmd: msgCmd?.t === "status-bar" ? msgCmd : null,
	});

	const toast = Toast.update({
		model: model.toast,
		msg: msg?.t === "toast" ? msg.c : null,
		msgCmd: msgCmd?.t === "toast" ? msgCmd : null,
		ctx,
		msgEvt: null,
		msgServer: null,
	});

	const lang = LangClient.update({
		model: model.lang,
		msg: msg?.t === "lang" ? msg.c : null,
		msgCmd: null,
		msgServer: msgServer?.t === "lang" ? msgServer.c : null,
		msgEvt: msgEvt,
		ctx: clientClient,
	});

	return {
		model: {
			auth: auth.model,
			platform: platform.model,
			profile: profile.model,
			routing: routing.model,
			sound: sound.model,
			spaces: space.model,
			statusBar: statusBar.model,
			toast: toast.model,
			wire: wire.model,
			lang: lang.model,
		},

		eff: Eff.batch<MsgClient>([
			Eff.tag("auth", auth.eff),
			Eff.tag("platform", platform.eff),
			Eff.tag("profile", profile.eff),
			Eff.tag("routing", routing.eff),
			Eff.tag("sound", sound.eff),
			Eff.tag("spaces", space.eff),
			Eff.tag("status-bar", statusBar.eff),
			Eff.tag("toast", toast.eff),
			Eff.tag("wire", wire.eff),
			Eff.tag("lang", lang.eff),
		]),

		msgEvt: batchMsgs<ClientEvent>(
			auth.msgEvt,
			profile.msgEvt,
			routing.msgEvt,
			sound.msgEvt,
			space.msgEvt,
			toast.msgEvt,
			wire.msgEvt,
			lang.msgEvt,
		),

		msgCmd: batchMsgs<
			ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
		>(
			ClientCmd.tag("auth", auth.msgCmd),
			ClientCmd.tag("profile", profile.msgCmd),
			ClientCmd.tag("spaces", space.msgCmd),
			ClientCmd.tag("lang", lang.msgCmd),
			routing.msgCmd,
			sound.msgCmd,
			toast.msgCmd,
		),
	};
};

const toClientCtx = (input: {
	model: ModelClient;
	ctx: Ctx;
}): ClientCtx | AnonymousClientCtx => {
	const anonymousCtx: AnonymousClientCtx = {
		...input.ctx,
		t: getTranslator(input.model.lang.lang),
		profiles: input.model.profile.profiles,
		now: input.ctx.now,
		documentVisibilityState: input.model.platform.documentVisibilityState,
		currentRoute: input.model.routing.currentRoute,
		currentUserId: null,
	};
	if (input.model.auth.currentUser.t === "logged-in") {
		return {
			...anonymousCtx,
			currentUserId: input.model.auth.currentUser.account.userId,
		};
	}
	return anonymousCtx;
};

//
//
//
//
// Subscriptions
//
//
//
//

export const subscriptions = (input: {
	ctx: Ctx;
	deps: Deps;
	model: ModelClient;
}) => {
	const ctx = toClientCtx(input);

	return Sub.batch<MsgClient>([
		Sub.tag("→", Sub.flat(input.deps.transport.toClient)),
		Sub.tag("wire", Wire.subscriptions({ transport: input.deps.transport })),
		Sub.tag("platform", Platform.subscriptions),
		Sub.tag("routing", Routing.subscriptions),
		Sub.tag("lang", LangClient.subscriptions({ ctx, model: input.model.lang })),
		Sub.tag("toast", Toast.subscriptions({ ctx, model: input.model.toast })),
		Sub.tag("auth", AuthClient.subscriptions({ ctx, model: input.model.auth })),
		Sub.tag(
			"spaces",
			SpaceClient.subscriptions({ ctx, model: input.model.spaces }),
		),
	]);
};

//
//
//
// View
//
//
//

export const View = (props: {
	ctx: Ctx;
	model: ModelClient;
	dispatch: (msg: MsgClient) => void;
}) => {
	const clientCtx = () => toClientCtx(props);

	return (
		<div
			className="fixed left-1/2 top-1/2 flex h-[100dvh] w-screen select-none items-center justify-center overflow-hidden bg-black text-white"
			style={{ transform: "translate(-50%, -50%)" }}
		>
			<div className="relative flex h-full max-h-[915px] w-full max-w-[520px] flex-col items-center justify-center overflow-hidden rounded border border-neutral-700">
				<ViewStatusBar
					model={props.model}
					dispatch={props.dispatch}
					ctx={props.ctx}
				/>

				<div className="relative flex w-full flex-1 flex-col overflow-hidden">
					<ViewRoute
						model={props.model}
						dispatch={props.dispatch}
						ctx={clientCtx()}
					/>
				</div>

				<AuthClient.ViewModals
					ctx={clientCtx()}
					dispatch={(c) => props.dispatch({ t: "auth", c })}
					model={props.model.auth}
				/>

				<Portal.Exit portalId="modals" />

				<Toast.View
					ctx={props.ctx}
					model={props.model.toast}
					dispatch={(c) => props.dispatch({ t: "toast", c })}
				/>
			</div>
		</div>
	);
};

const ViewRoute = (props: {
	ctx: ClientCtx | AnonymousClientCtx;
	model: ModelClient;
	dispatch: (m: MsgClient) => void;
}) => {
	switch (props.model.routing.currentRoute.n) {
		case "lang": {
			return (
				<LangClient.View
					ctx={props.ctx}
					dispatch={(c) => props.dispatch({ t: "lang", c })}
					model={props.model.lang}
				/>
			);
		}

		default: {
			switch (props.model.auth.currentUser.t) {
				case "loading": {
					return <LoadingState />;
				}

				case "logged-in": {
					return (
						<ViewRouteLoggedIn
							model={props.model}
							dispatch={props.dispatch}
							ctx={props.ctx}
						/>
					);
				}

				case "logged-out": {
					return (
						<ViewRouteLoggedOut
							model={props.model}
							dispatch={props.dispatch}
							ctx={props.ctx}
						/>
					);
				}
			}
		}
	}
};

const ViewRouteLoggedOut: typeof ViewRoute = (props) => {
	switch (props.ctx.currentRoute.n) {
		case "auth-login": {
			return (
				<AuthClient.View
					model={props.model.auth}
					ctx={props.ctx}
					dispatch={(c) => props.dispatch({ t: "auth", c })}
				/>
			);
		}
		case "spaces":
		case "profile":
		case "lang": {
			return (
				<ViewRedirect
					dispatch={props.dispatch}
					route={{ n: "auth-login", t: "login" }}
				/>
			);
		}
	}
};

const ViewRouteLoggedIn: typeof ViewRoute = (props) => {
	switch (props.ctx.currentRoute.n) {
		case "profile": {
			return (
				<ProfileClient.View
					dispatch={(m) => props.dispatch({ t: "profile", c: m })}
					model={props.model.profile}
					ctx={props.ctx}
					slots={{
						bottomBar: () => (
							<ViewBottomNavBar
								model={props.model}
								dispatch={props.dispatch}
								ctx={props.ctx}
							/>
						),
					}}
				/>
			);
		}

		case "spaces": {
			return (
				<SpaceClient.View
					dispatch={(m) => props.dispatch({ t: "spaces", c: m })}
					model={props.model.spaces}
					ctx={props.ctx}
					slots={{
						bottomBar: () => (
							<ViewBottomNavBar
								model={props.model}
								dispatch={props.dispatch}
								ctx={props.ctx}
							/>
						),
					}}
				/>
			);
		}

		case "lang":
		case "auth-login": {
			return (
				<ViewRedirect
					dispatch={props.dispatch}
					route={{ n: "spaces", t: "space-list" }}
				/>
			);
		}
	}
};

const ViewRedirect = (input: {
	route: Route;
	dispatch: (m: MsgClient) => void;
}) => {
	return (
		<IntersectionObserverEmitter
			id="redirect"
			onVisible={() =>
				input.dispatch({
					t: "routing",
					c: { t: "clicked-link", route: input.route },
				})
			}
		/>
	);
};

const ViewStatusBar: typeof View = (input) => {
	const clientCtx = toClientCtx({ model: input.model, ctx: input.ctx });

	return (
		<StatusBar.View
			model={input.model.statusBar}
			dispatch={(c) => input.dispatch({ t: "status-bar", c })}
			slots={{
				barLeft: (
					<>
						<Wire.ViewStatusBar model={input.model.wire} />
					</>
				),

				barRight: (
					<>
						<Sound.ViewStatusBar model={input.model.sound} />
					</>
				),

				drawerContent: (
					<>
						<Wire.ViewStatusBarDrawer
							model={input.model.wire}
							dispatch={(c) => input.dispatch({ t: "wire", c })}
						/>

						<LangClient.ViewStatusBarDrawer
							ctx={clientCtx}
							dispatch={(c) => input.dispatch({ t: "lang", c })}
							model={input.model.lang}
						/>

						<Sound.ViewStatusBarDrawer
							model={input.model.sound}
							dispatch={(c) => input.dispatch({ t: "sound", c })}
						/>
					</>
				),
			}}
		/>
	);
};

const ViewBottomNavBar = (props: {
	ctx: ClientCtx | AnonymousClientCtx;
	model: ModelClient;
	dispatch: (m: MsgClient) => void;
}) => {
	if (isAnonymous(props.ctx)) {
		return null;
	}
	const items: {
		route: Route;
		label: string;
		icon: VDom;
	}[] = [
		{
			route: {
				n: "spaces",
				t: "space-list",
			},
			label: "Spaces",
			icon: <IconGamepad className="h-6 w-6" />,
		},
		{
			route: {
				n: "profile",
				t: "profile",
				userId: props.ctx.currentUserId,
			},
			label: "Profile",
			icon: <IconUserCircle className="h-6 w-6" />,
		},
	];

	return (
		<div className="flex w-full shrink-0 flex-col items-center justify-center">
			<SpaceClient.ViewCurrentSpaceBar
				ctx={props.ctx}
				model={props.model.spaces}
				dispatch={(c) => props.dispatch({ t: "spaces", c })}
			/>
			<div className="flex w-full items-center justify-center border-t border-neutral-700">
				{items.map((item, index) => {
					const isSelected = eq(item.route, props.model.routing.currentRoute);
					return (
						<button
							key={index}
							onClick={() =>
								props.dispatch({
									t: "routing",
									c: { t: "clicked-link", route: item.route },
								})
							}
							className={cn(
								"flex flex-1 flex-col items-center justify-center pb-2 pt-1",
								isSelected ? "text-blue-500" : "text-opacity-50",
								index < items.length - 1 ? "border-r border-neutral-700" : "",
							)}
						>
							{item.icon}
							<div className="mt-0.5 text-xs text-inherit">{item.label}</div>
						</button>
					);
				})}
			</div>
		</div>
	);
};
