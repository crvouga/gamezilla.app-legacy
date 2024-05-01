import type {
	ClientId,
	SessionId,
	UserId,
} from "gamezilla-app/app/@shared/data";
import type { UserAccount } from "../data/account";

export type ServerEvent =
	| {
			t: "wire/client-connected";
			clientId: ClientId;
			sessionId: SessionId;
			userId?: UserId;
	  }
	| {
			t: "wire/client-disconnected";
			clientId: ClientId;
			sessionId: SessionId;
	  }
	| {
			t: "auth/client-authenticated";
			account: UserAccount;
			sessionId: SessionId;
			clientId: ClientId;
			loggedIn?: boolean;
	  }
	| {
			t: "auth/client-unauthenticated";
			sessionId: SessionId;
			clientId: ClientId;
	  };
