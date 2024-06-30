import { TimeSpan, type UnitInterval, eq } from "gamezilla-app/@/core";
import type { Route } from "gamezilla-app/@/routing/generated/routes";
import type { Profile, UserId } from "../data";

//
//
//
//
//
//

export type ClientCmdTypes = {
	MsgClient: unknown;
	MsgToServer: unknown;
};

export type ClientCmd<T extends ClientCmdTypes> =
	| WireCmd<T>
	| ToastCmd
	| RouteCmd
	| SoundCmd
	| PlatformCmd<T["MsgClient"]>
	| ProfileCmd
	| StatusBarCmd
	| AuthCmd;

//
//
//
//
//
//

export type AuthCmd = {
	t: "auth";
	c: {
		t: "logout";
	};
};

export const logout = <T extends ClientCmdTypes>(): ClientCmd<T> => {
	return {
		t: "auth",
		c: {
			t: "logout",
		},
	};
};

//
//
//
//

export type StatusBarCmd = {
	t: "status-bar";
	c: {
		t: "close";
	};
};

export const closeStatusBar = <T extends ClientCmdTypes>(): ClientCmd<T> => {
	return {
		t: "status-bar",
		c: {
			t: "close",
		},
	};
};

//
//
//
//
//

export type ProfileCmd =
	| {
			t: "profile";
			c: {
				t: "add-profiles";
				profiles: {
					[userId: UserId]: Profile;
				};
			};
	  }
	| {
			t: "profile";
			c: {
				t: "open-profile";
				userId: UserId;
			};
	  };

export const addProfiles = <T extends ClientCmdTypes>(profiles: {
	[userId: UserId]: Profile;
}): ClientCmd<T> => {
	return { t: "profile", c: { t: "add-profiles", profiles } };
};

export const openProfile = <T extends ClientCmdTypes>(
	userId: UserId,
): ClientCmd<T> => {
	return { t: "profile", c: { t: "open-profile", userId } };
};

export const didOpenProfile = <T>(
	{
		msgCmd,
	}: {
		msgCmd?: (ProfileCmd | T)[];
	},
	userId: UserId,
): boolean => {
	return (
		msgCmd?.some(
			(cmd) =>
				typeof cmd === "object" &&
				cmd &&
				"t" in cmd &&
				cmd.t === "profile" &&
				cmd.c.t === "open-profile" &&
				cmd.c.userId === userId,
		) ?? false
	);
};

//
//
//
//
//

export type PlatformCmd<Msg> = {
	t: "platform";
	c:
		| {
				t: "focus";
				viewId: string;
		  }
		| {
				t: "start-timeout";
				timeoutId: string | number;
				duration: TimeSpan;
				msg: Msg;
		  }
		| {
				t: "cancel-timeout";
				timeoutId: string | number;
		  }
		| {
				t: "copy-to-clipboard";
				text: string;
		  };
};

export const focusView = <T extends ClientCmdTypes>(
	viewId: string,
): ClientCmd<T> => {
	return { t: "platform", c: { t: "focus", viewId: viewId } };
};

export const startTimeout = <T extends ClientCmdTypes>(
	timeoutId: string | number,
	duration: TimeSpan,
	msg: T["MsgClient"],
): ClientCmd<T> => {
	return {
		t: "platform",
		c: {
			t: "start-timeout",
			timeoutId,
			duration,
			msg,
		},
	};
};

export const cancelTimeout = <T extends ClientCmdTypes>(
	timeoutId: string | number,
): ClientCmd<T> => {
	return {
		t: "platform",
		c: {
			t: "cancel-timeout",
			timeoutId,
		},
	};
};

export const copyToClipboard = <T extends ClientCmdTypes>(
	text: string,
): ClientCmd<T> => {
	return {
		t: "platform",
		c: {
			t: "copy-to-clipboard",
			text,
		},
	};
};

export const didCopyToClipboard = <T extends ClientCmdTypes, TCmd>(
	{
		msgCmd,
	}: {
		msgCmd?: (PlatformCmd<T["MsgClient"]> | TCmd)[];
	},
	isValidText?: (text: string) => boolean,
): boolean => {
	return (
		msgCmd?.some(
			(cmd) =>
				typeof cmd === "object" &&
				cmd &&
				"t" in cmd &&
				cmd.t === "platform" &&
				cmd.c.t === "copy-to-clipboard" &&
				(typeof isValidText === "function" ? isValidText(cmd.c.text) : true),
		) ?? false
	);
};

//
//
//
//
//

export type WireCmd<T extends ClientCmdTypes> = {
	t: "wire";
	c: {
		t: "send-to-server";
		msg: T["MsgToServer"] | null;
	};
};

/**
 * A msgCmd creator for sending a messages to the server.
 */
export const sendToServer = <T extends ClientCmdTypes>(
	msg: T["MsgToServer"],
): ClientCmd<T> => {
	return {
		t: "wire",
		c: {
			t: "send-to-server",
			msg,
		},
	};
};

export const didSendToServer = <T extends ClientCmdTypes, TCmd>(
	{
		msgCmd,
	}: {
		msgCmd?: (WireCmd<T> | TCmd)[];
	},
	predicate: (msg: T["MsgToServer"]) => boolean,
): boolean => {
	return (
		msgCmd?.some(
			(cmd) =>
				typeof cmd === "object" &&
				cmd &&
				"t" in cmd &&
				cmd.t === "wire" &&
				cmd.c.t === "send-to-server" &&
				cmd.c.msg &&
				predicate(cmd.c.msg),
		) ?? false
	);
};

//
//
//
//
//
//

export type ToastCmd = {
	t: "toast";
	c: {
		t: "enqueue";
		text: string;
		toastVariant?: "error" | "info";
		duration?: TimeSpan;
		errorMsg?: string;
	};
};

export const showToast = <T extends ClientCmdTypes>(
	text: string,
	variant?: "error" | "info",
	duration?: TimeSpan,
): ClientCmd<T> => {
	return {
		t: "toast",
		c: {
			t: "enqueue",
			text,
			toastVariant: variant,
			duration,
		},
	};
};

export const didShowToast = <T>(
	output?: {
		msgCmd?: (ToastCmd | T)[];
	},
	predicate?: (toast: { message: string }) => boolean,
): boolean => {
	return (
		output?.msgCmd?.some((cmd) => {
			return (
				typeof cmd === "object" &&
				cmd !== null &&
				"t" in cmd &&
				cmd.t === "toast" &&
				cmd.c.t === "enqueue" &&
				(predicate ? predicate({ message: cmd.c.text }) : true)
			);
		}) ?? false
	);
};

export const showCreatedSm = <T extends ClientCmdTypes>(
	text: string,
): ClientCmd<T>[] => {
	return [
		{
			t: "toast",
			c: {
				t: "enqueue",
				text,
			},
		},
		{
			t: "sound",
			c: {
				t: "play",
				src: APP_SOUND.refreshFeed,
			},
		},
	];
};

export const showErrSm = <T extends ClientCmdTypes>(
	text: string,
	errorMsg?: string,
	duration?: TimeSpan,
): ClientCmd<T>[] => {
	return [
		{
			t: "toast",
			c: {
				t: "enqueue",
				text,
				toastVariant: "error",
				errorMsg,
				duration: duration ?? TimeSpan.seconds(4),
			},
		},
		{
			t: "sound",
			c: {
				t: "play",
				src: APP_SOUND.alertErrorSm,
			},
		},
	];
};

export const didShowErrorSm = <TCmd>(
	{
		msgCmd,
	}: {
		msgCmd?: (ToastCmd | SoundCmd | TCmd)[];
	},
	errorMessage?: string,
): boolean => {
	const isSomeErrorToast =
		msgCmd?.some(
			(cmd) =>
				typeof cmd === "object" &&
				cmd &&
				"t" in cmd &&
				cmd.t === "toast" &&
				cmd.c.t === "enqueue" &&
				cmd.c.toastVariant === "error" &&
				(errorMessage ? cmd.c.text === errorMessage : true),
		) ?? false;

	const isSomeErrorSound =
		msgCmd?.some(
			(cmd) =>
				typeof cmd === "object" &&
				cmd &&
				"t" in cmd &&
				cmd.t === "sound" &&
				cmd.c.t === "play" &&
				cmd.c.src === APP_SOUND.alertErrorSm,
		) ?? false;
	return isSomeErrorToast && isSomeErrorSound;
};

//
//
//
//
//
//
//

export type SoundCmd = {
	t: "sound";
	c:
		| {
				t: "play";
				src: string;
				volume?: UnitInterval;
				delay?: TimeSpan;
		  }
		| {
				t: "preload";
				src: string[];
		  };
};

export const APP_SOUND = {
	tap: "./app/tap.wav",
	alertErrorLg: "./app/alert-error-lg.wav",
	alertErrorMd: "./app/alert-error-md.wav",
	alertErrorSm: "./app/alert-error-sm.wav",
	celebration: "./app/celebration.wav",
	celebrationDecorative: "./app/celebration-decorative.wav",
	navForward: "./app/nav-forward.wav",
	navBackward: "./app/nav-backward.wav",
	navForwardMin: "./app/nav-forward-min.wav",
	navBackwardMin: "./app/nav-backward-min.wav",
	navTransitionLeft: "./app/nav-transition-left.wav",
	stateChangeUp: "./app/state-change-up.wav",
	stateChangeDown: "./app/state-change-down.wav",
	refreshFeed: "./app/refresh-feed.wav",
};

export const playSound = (
	src: string,
	config?: {
		volume?: UnitInterval;
		delay?: TimeSpan;
	},
): SoundCmd => {
	return {
		t: "sound",
		c: {
			t: "play",
			src,
			volume: config?.volume,
			delay: config?.delay,
		},
	};
};

export const didPlaySound = <T>(
	{
		msgCmd,
	}: {
		msgCmd?: (SoundCmd | T)[];
	},
	src?: string,
): boolean => {
	return (
		msgCmd?.some(
			(cmd) =>
				typeof cmd === "object" &&
				cmd &&
				"t" in cmd &&
				cmd.t === "sound" &&
				cmd.c.t === "play" &&
				(src ? cmd.c.src === src : true),
		) ?? false
	);
};

export const preloadSound = <T extends ClientCmdTypes>(
	src: string[],
): ClientCmd<T> => {
	return {
		t: "sound",
		c: {
			t: "preload",
			src,
		},
	};
};

//
//
//
//
//
//
//
//

export type RouteCmd = {
	t: "routing";
	c:
		| {
				t: "push";
				route: Route;
				playSound?: boolean;
		  }
		| {
				t: "replace";
				route: Route;
				reason?: string;
				playSound?: boolean;
		  }
		| {
				t: "back";
				reason?: string;
				playSound?: boolean;
		  };
};

export const pushRoute = <T extends ClientCmdTypes>(
	route: Route,
	playSound?: boolean,
): ClientCmd<T> => {
	return {
		t: "routing",
		c: { t: "push", route, playSound },
	};
};

export const didPushRoute = <T>(
	output?: {
		msgCmd?: (RouteCmd | T)[];
	},
	predicate?: (route: Route) => boolean,
): boolean => {
	return Boolean(
		output?.msgCmd?.some((cmd) => {
			if (
				typeof cmd === "object" &&
				cmd &&
				"t" in cmd &&
				cmd.t === "routing" &&
				cmd.c.t === "push"
			) {
				if (predicate) {
					return predicate(cmd.c.route);
				}
				return true;
			}
			return false;
		}),
	);
};

export const replaceRoute = <T extends ClientCmdTypes>(
	route: Route,
	playSound?: boolean,
): ClientCmd<T> => {
	return {
		t: "routing",
		c: {
			t: "replace",
			route,
			playSound: playSound ?? true,
		},
	};
};

export const didReplaceRoute = <T extends ClientCmdTypes>(
	{
		msgCmd,
	}: {
		msgCmd?: ClientCmd<T>[];
	},
	route?: Route,
): boolean => {
	return Boolean(
		msgCmd?.some((cmd) => {
			if (cmd.t === "routing" && cmd.c.t === "replace") {
				if (route) {
					return eq(cmd.c.route, route);
				}
				return true;
			}
			return false;
		}),
	);
};

export const back = <T extends ClientCmdTypes>(
	reason?: string,
): ClientCmd<T> => {
	return {
		t: "routing",
		c: {
			t: "back",
			reason,
			playSound: true,
		},
	};
};

//
//
//
//
//
//
//
//

const tagOne = <Tag extends string, T extends ClientCmdTypes>(
	t: Tag,
	msgCmd: ClientCmd<T>,
): ClientCmd<{
	MsgClient: { t: Tag; c: T["MsgClient"] };
	MsgToServer: { t: Tag; c: T["MsgToServer"] };
}> => {
	switch (msgCmd.t) {
		case "wire": {
			switch (msgCmd.c.t) {
				case "send-to-server": {
					if (msgCmd.c.msg) {
						return {
							...msgCmd,
							c: { ...msgCmd.c, msg: { t, c: msgCmd.c.msg } },
						};
					}
					return {
						...msgCmd,
						c: { ...msgCmd.c, msg: { t, c: null } },
					};
				}
				default: {
					return msgCmd as ClientCmd<{
						MsgClient: { t: Tag; c: T["MsgClient"] };
						MsgToServer: { t: Tag; c: T["MsgToServer"] };
					}>;
				}
			}
		}

		case "platform": {
			switch (msgCmd.c.t) {
				case "start-timeout": {
					return {
						...msgCmd,
						c: {
							...msgCmd.c,
							msg: {
								t,
								c: msgCmd.c.msg,
							},
						},
					};
				}

				default: {
					return msgCmd as ClientCmd<{
						MsgClient: { t: Tag; c: T["MsgClient"] };
						MsgToServer: { t: Tag; c: T["MsgToServer"] };
					}>;
				}
			}
		}

		default: {
			return msgCmd;
		}
	}
};

const tag = <Tag extends string, T extends ClientCmdTypes>(
	tag: Tag,
	msgCmd?: (ClientCmd<T> | null | undefined)[] | null | undefined,
): ClientCmd<{
	MsgClient: { t: Tag; c: T["MsgClient"] };
	MsgToServer: { t: Tag; c: T["MsgToServer"] };
}>[] => {
	return msgCmd?.flatMap((c) => (c ? [tagOne(tag, c)] : [])) ?? [];
};

const map = <A extends ClientCmdTypes, B extends ClientCmdTypes>(
	msgCmd: ClientCmd<A>[],
	toServerMap: (a: A["MsgToServer"]) => B["MsgToServer"],
	clientMsgMap: (b: A["MsgClient"]) => B["MsgClient"],
): ClientCmd<B>[] => {
	return msgCmd.map((msgCmd) => {
		switch (msgCmd.t) {
			case "wire": {
				switch (msgCmd.c.t) {
					case "send-to-server": {
						if (msgCmd.c.msg) {
							return {
								...msgCmd,
								c: {
									...msgCmd.c,
									msg: toServerMap(msgCmd.c.msg),
								},
							};
						}
						return { ...msgCmd, c: { ...msgCmd.c, msg: null } };
					}
					default: {
						return msgCmd;
					}
				}
			}

			case "platform": {
				switch (msgCmd.c.t) {
					case "start-timeout": {
						return {
							...msgCmd,
							c: {
								...msgCmd.c,
								msg: clientMsgMap(msgCmd.c.msg),
							},
						};
					}

					default: {
						return msgCmd;
					}
				}
			}

			default: {
				return msgCmd;
			}
		}
	});
};
export const ClientCmd = {
	tagOne,
	tag,
	map,
};
