import { Posix } from "gamezilla-app/@/core";
import { UserId } from "../data";
import { ClientCtx } from "./client-ctx";
import { Translator } from "./translator";

export const AppClientFixture = async () => {
	const currentUserId = UserId.generate();
	const ctx: ClientCtx = {
		currentRoute: {
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

	return {
		ctx,
	};
};
