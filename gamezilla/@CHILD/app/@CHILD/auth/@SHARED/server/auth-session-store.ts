import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ServerCtx } from "gamezilla/@CHILD/app/@SHARED/server";
import { SqliteStore } from "gamezilla/@SHARED/immutable-store";

const connectionString = "sqlite:data/gamezilla-session.db";

export const StoreUserIdBySessionId = (_ctx: ServerCtx) => {
  return SqliteStore<SessionId, UserId>({
    connectionString,
    keySpace: "auth/user-id-by-session-id",
    decodeValue: (encoded) => (UserId.is(encoded) ? encoded : null),
    encodeValue: (value) => value,
  });
};

export const StoreSessionIdByUserId = (_ctx: ServerCtx) => {
  return SqliteStore<UserId, { [sessionId: SessionId]: SessionId }>({
    connectionString,
    keySpace: "auth/session-ids-by-user-id",
    decodeValue: (encoded) => {
      try {
        if (!encoded) {
          return {};
        }
        const decoded = JSON.parse(encoded);
        const sessionIds: { [sessionId: SessionId]: SessionId } = {};
        for (const sessionId in decoded) {
          if (SessionId.is(sessionId)) {
            sessionIds[sessionId] = sessionId;
          }
        }
        return sessionIds;
      } catch {
        return {};
      }
    },
    encodeValue: (value) => {
      return JSON.stringify(value);
    },
  });
};
