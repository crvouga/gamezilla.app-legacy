import { Posix } from "gamezilla-app/@/core";
import { RenderToNode } from "gamezilla-app/@/vdom";
import { UserId } from "../data";
import type { ClientCtx } from "./client-ctx";
import { Translator } from "./translator";
import type { Route } from "gamezilla-app/@/routing/generated/routes";

export const AppClientFixture = async (input?: { currentRoute?: Route }) => {
	const currentUserId = UserId.generate();
	const ctx: ClientCtx = {
		currentRoute: input?.currentRoute ?? {
			n: "auth-login",
			t: "login",
		},
		currentUserId,
		documentVisibilityState: "visible",
		navigatorLanguage: "en",
		now: Posix.now(),
		profiles: {},
		t: Translator("en"),
	};

	const render = await RenderToNode();

	return {
		ctx,
		render,
	};
};
