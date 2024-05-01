import type { Route } from "gamezilla-app/@shared/routing/generated/routes";
import type { UserAccount } from "../data/account";

export type ClientEvent =
	| { t: "auth/authenticated"; account: UserAccount; loggedIn?: boolean }
	| { t: "auth/unauthenticated" }
	| { t: "wire/server-connected" }
	| { t: "routing/route-changed"; route: Route }
	| {
			t: "platform/document-visibility-changed";
			state: DocumentVisibilityState;
	  }
	| { t: "time/elapsed" };

export const routeChanged = (route: Route): ClientEvent => {
	return { t: "routing/route-changed", route };
};

export const serverConnected = (): ClientEvent => {
	return { t: "wire/server-connected" };
};
