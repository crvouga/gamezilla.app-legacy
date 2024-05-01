import { AppClientModule } from "gamezilla-app/app/@/architecture/app-client";
import {
	APP_SOUND,
	type BaseClientCtx,
	ClientCmd,
	playSound,
	pushRoute,
	replaceRoute,
	showToast,
} from "gamezilla-app/app/@/client";
import { Button, IconMobilePhone } from "gamezilla-app/app/@/ui";
import { Eff, Sub, batchMsgs, notAsked } from "gamezilla-app/@/core";
import * as AuthClientSMS from "./auth-sms/auth-sms.client";
import type { ClientModule, ModelClient, MsgClient } from "./auth.core";
import { ContinueAsGuestClient } from "./continue-as-guest/continue-as-guest.client";
import { LogoutClient } from "./logout/logout.client";

//
//
//
// Model
//
//
//

export const init: ClientModule["init"] = (input) => {
	const sms = AuthClientSMS.init(input);

	return {
		model: {
			...ContinueAsGuestClient.initModel,
			currentUser: { t: "loading" },
			loginWithGoogle: notAsked,
			logout: notAsked,
			sms: sms.model,
			opened: null,
		},
		eff: Eff.batch([Eff.tag("sms", sms.eff)]),
		msgEvt: batchMsgs(sms.msgEvt),
		msgCmd: batchMsgs(ClientCmd.tag("sms", sms.msgCmd)),
	};
};

//
//
//
// Update
//
//
//

export const update: ClientModule["update"] = (input) => {
	return AppClientModule.andThen(
		{ model: input.model },
		(model) => updateFromMsg({ ...input, model }),
		(model) => updateFromServer({ ...input, model }),
		(model) => updateFromEvent({ ...input, model }),
		(model) => updateChild({ ...input, model }),
		(model) => ContinueAsGuestClient.update({ ...input, model }),
		(model) => LogoutClient.update({ ...input, model }),
	);
};

const updateChild: ClientModule["update"] = (input) => {
	const updated = AuthClientSMS.update({
		ctx: input.ctx,
		model: input.model.sms,
		msgCmd: null,
		msgEvt: input.msgEvt,
		msgServer: input.msgServer?.t === "sms" ? input.msgServer.c : null,
		msg: input.msg?.t === "sms" ? input.msg.c : null,
	});

	return {
		model: { ...input.model, sms: updated.model },
		msgCmd: ClientCmd.tag("sms", updated.msgCmd),
		eff: Eff.tag("sms", updated.eff),
		msgEvt: updated.msgEvt,
	};
};

const updateFromMsg: ClientModule["update"] = (input) => {
	if (!input.msg) {
		return { model: input.model };
	}
	const { model, msg } = input;
	switch (msg.t) {
		case "user-clicked-login-with-phone": {
			return {
				model,
				msgCmd: [
					pushRoute({
						n: "auth-login",
						t: "login-sms-request",
					}),
					playSound(APP_SOUND.navForwardMin),
				],
			};
		}

		default: {
			return { model };
		}
	}
};

const updateFromServer: ClientModule["update"] = (input) => {
	const { model, msgServer } = input;

	switch (msgServer?.t) {
		case "client-unauthenticated": {
			return {
				model: { ...model, currentUser: { t: "logged-out" } },
				msgEvt: [{ t: "auth/unauthenticated" }],
			};
		}

		case "client-authenticated": {
			return {
				model: {
					...model,
					currentUser: {
						t: "logged-in",
						account: msgServer.account,
					},
				},
				msgEvt: [
					{ ...msgServer, account: msgServer.account, t: "auth/authenticated" },
				],
			};
		}

		default: {
			return { model };
		}
	}
};

const updateFromEvent: ClientModule["update"] = (input) => {
	return updateRedirect(input);
};

const updateRedirect: ClientModule["update"] = (input) => {
	if (!input.msgEvt) {
		return { model: input.model };
	}

	const { ctx, msgEvt, model } = input;

	switch (msgEvt.t) {
		case "auth/authenticated": {
			if (!msgEvt.loggedIn) {
				return { model };
			}

			const toastMessage =
				msgEvt.account.role === "guest"
					? ctx.t("auth.logged-in-as-guest")
					: ctx.t("auth.logged-in");

			return {
				model,
				msgCmd: [
					replaceRoute({ n: "spaces", t: "space-list" }, false),
					playSound(APP_SOUND.celebration),
					showToast(toastMessage),
				],
			};
		}

		case "routing/route-changed": {
			if (
				model.currentUser.t === "logged-in" &&
				ctx.currentRoute.n === "auth-login"
			) {
				return {
					model,
					msgCmd: [
						replaceRoute({ n: "spaces", t: "space-list" }),
						showToast("Logged in"),
					],
				};
			}

			return { model };
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

export const subscriptions: ClientModule["subscriptions"] = ({
	model,
	ctx,
}) => {
	return Sub.tag("sms", AuthClientSMS.subscriptions({ model: model.sms, ctx }));
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
		case "auth-login": {
			switch (props.ctx.currentRoute.t) {
				case "login": {
					return <ViewLoginScreen {...props} />;
				}
				case "login-sms-request":
				case "login-sms-verify": {
					return (
						<AuthClientSMS.View
							ctx={props.ctx}
							dispatch={(c) => props.dispatch({ t: "sms", c })}
							model={props.model.sms}
						/>
					);
				}
			}
		}
		default: {
			return null;
		}
	}
};

const ViewLoginScreen: ClientModule["View"] = (props) => {
	return (
		<div className="relative flex h-full w-full flex-1 flex-col">
			<div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
				<div className="flex w-full flex-col items-start justify-center">
					<p className="text-2xl text-neutral-200">
						{props.ctx.t("auth.sign-in-to")}
					</p>
					<h1 className="bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text pb-2 text-5xl font-extrabold text-transparent">
						gamezilla.app
					</h1>
				</div>

				<div className="flex w-full flex-col gap-6">
					<Button
						onClick={() =>
							props.dispatch({ t: "user-clicked-login-with-phone" })
						}
						size="lg"
						className="w-full"
						start={<IconMobilePhone className="h-6 w-6" />}
						text={props.ctx.t("auth.continue-with-phone")}
					/>

					<div className="flex w-full items-center justify-center py-1">
						<p className="text-base font-bold uppercase text-neutral-300">
							{props.ctx.t("auth.or")}
						</p>
					</div>

					<ContinueAsGuestClient.ViewButton {...props} />
				</div>
			</div>
		</div>
	);
};

export const ViewModals = (input: {
	ctx: BaseClientCtx;
	model: ModelClient;
	dispatch: (msg: MsgClient) => void;
}) => {
	return <LogoutClient.View {...input} />;
};
