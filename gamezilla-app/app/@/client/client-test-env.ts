import { Posix } from "gamezilla-app/@/core";
import type { Route } from "gamezilla-app/@/routing/generated/routes";
import { TestRender } from "gamezilla-app/@/vdom/test-render";
import { UserId } from "../data";
import type { ClientCtx } from "./client-ctx";
import { Translator } from "./translator";
import { VDOM_IMPL_TEST } from "public-config";

export const AppClientFixture = async (input?: { currentRoute?: Route }) => {
	const currentUserId = UserId.generate();
	const ctx: ClientCtx = {
		currentRoute: input?.currentRoute ?? {
			n: "auth-login",
			t: "login",
		},
		currentUserId,
		currentUserRole: "normal",
		documentVisibilityState: "visible",
		navigatorLanguage: "en",
		now: Posix.now(),
		profiles: {},
		t: Translator("en"),
	};

	const render = await TestRender(VDOM_IMPL_TEST);

	return {
		ctx,
		render,
	};
};
