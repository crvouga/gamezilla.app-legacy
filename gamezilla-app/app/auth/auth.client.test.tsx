import { describe, expect, it } from "bun:test";
import { Posix } from "gamezilla-app/@/core";
import { andThen } from "../@/architecture/app-client";
import {
	type AnonymousClientCtx,
	type ClientCtx,
	didPlaySound,
	didPushRoute,
} from "../@/client";
import { getTranslator } from "../@/client/translator";
import * as AuthClient from "./auth.client";
import type * as AuthCore from "./auth.core";

const ctx: AnonymousClientCtx = {
	currentRoute: {
		n: "auth-login",
		t: "login",
	},
	navigatorLanguage: "en",
	t: getTranslator("en"),
	documentVisibilityState: "visible",
	now: Posix.now(),
	profiles: {},
	currentUserId: null,
};

const initial = {
	model: AuthClient.init({
		ctx,
	}).model,
};

const clickedContinueWithPhone =
	(ctx: ClientCtx | AnonymousClientCtx) => (model: AuthCore.ModelClient) => {
		return AuthClient.update({
			ctx,
			model,
			msg: {
				t: "user-clicked-login-with-phone",
			},
		});
	};

describe(import.meta.file, () => {
	it("should make a sound clicking the contine with phone button", () => {
		const output = andThen(initial, clickedContinueWithPhone(ctx));
		expect(didPlaySound(output)).toBe(true);
	});

	it("should push auth phone route after clicking continue with phone button", () => {
		const output = andThen(initial, clickedContinueWithPhone(ctx));
		expect(
			didPushRoute(
				output,
				(route) => route.n === "auth-login" && route.t === "login-sms-request",
			),
		).toBe(true);
	});
});
