import type { SessionId, UserId } from "gamezilla-app/app/@shared/data";
import type { Client } from "../wire.core";
import type { Task } from "gamezilla-app/@shared/core";

export type IWireSessionDb = {
	clients: {
		findBySessionIds: (sessionIds: SessionId[]) => Task<string, Client[]>;
		set: (sessionId: SessionId, client: Client) => Task<string, null>;
	};
	sessionIds: {
		findByUserIds: (userIds: UserId[]) => Task<string, SessionId[]>;
		set: (userId: UserId, sessionIds: SessionId[]) => Task<string, null>;
	};
};
