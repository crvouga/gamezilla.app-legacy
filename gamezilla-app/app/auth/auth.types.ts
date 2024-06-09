import type { RemoteResult, TimeSpan } from "gamezilla-app/@/core";
import type { AppClientModule } from "../@/architecture/app-client";
import type { AppServerModule } from "../@/architecture/app-server";
import type {
	AnonymousClientCtx,
	AuthCmd,
	ClientCmd,
	ClientCtx,
	ClientEvent,
} from "../@/client";
import type { UserAccount } from "../@/data/account";
import type { ServerCmd, ServerCtx, ServerEvent } from "../@/server";
import type { IUserAccountDb } from "./@/server/user-account-db";
import type { IUserSessionDb } from "./@/server/user-session-db";
import type * as AuthSMS from "./auth-sms/auth-sms.types";
import type { ContinueAsGuest } from "./continue-as-guest";
import type { Logout } from "./logout";
import { IGuestSessionMappingDb } from "./continue-as-guest/guest-session-mapping-db";

//
//
//
//
//
//

export type ClientModule = AppClientModule<{
	Model: ModelClient;
	Msg: MsgClient;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	Ctx: AnonymousClientCtx | ClientCtx;
	MsgCmdIn: AuthCmd;
	MsgEvtIn: ClientEvent;
	MsgCmdOut: ClientCmd<{
		MsgClient: MsgClient;
		MsgToServer: MsgToServer;
	}>;
	MsgEvtOut: ClientEvent;
}>;

export type ServerModule = AppServerModule<{
	Ctx: ServerCtx;
	MsgCmdIn: null;
	MsgEvtIn: ServerEvent;
	Model: null;
	Msg: MsgServer;
	MsgCmdOut: ServerCmd<MsgToClient>;
	MsgEvtOut: ServerEvent;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	Deps: ServerDeps;
}>;

export type ServerDeps = {
	userAccountDb: IUserAccountDb;
	userSessionDb: IUserSessionDb;
	guestSessionMappingDb: IGuestSessionMappingDb;
	timeout: (timeSpan: TimeSpan) => Promise<unknown>;
};

//
//
//
//
//
//

type BaseModelClient = {
	loginWithGoogle: RemoteResult<string, null>;
	logout: RemoteResult<string, null>;
	opened: "logged-out" | null;
	currentUser:
		| { t: "loading" }
		| { t: "logged-out" }
		| { t: "logged-in"; account: UserAccount };
	sms: AuthSMS.ModelClient;
};

export type ModelClient = BaseModelClient &
	ContinueAsGuest.ModelClient &
	Logout.ModelClient;

//
//
// Msg
//
//

export type MsgClient =
	| ContinueAsGuest.MsgClient
	| Logout.MsgClient
	| { t: "user-clicked-login-with-phone" }
	| { t: "sms"; c: AuthSMS.MsgClient };

export type MsgServer =
	| ContinueAsGuest.MsgServer
	| Logout.MsgClient
	| {
			t: "sms";
			c: AuthSMS.MsgServer;
	  };

export type MsgToServer =
	| ContinueAsGuest.MsgToServer
	| Logout.MsgToServer
	| { t: "client-checked-auth" }
	| { t: "sms"; c: AuthSMS.MsgToServer };

export type MsgToClient =
	| ContinueAsGuest.MsgToClient
	| Logout.MsgToClient
	| { t: "client-authenticated"; account: UserAccount; loggedIn: boolean }
	| { t: "client-unauthenticated"; sessionId?: never }
	| { t: "sms"; c: AuthSMS.MsgToClient };
