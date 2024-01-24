import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ServerCtx } from "gamezilla/@CHILD/app/@SHARED/server";
import { InMemoryStore, SqliteStore } from "gamezilla/@SHARED/immutable-store";

const connectionString = "data/gamezilla-session.db";

export const StoreUserIdBySessionId = (_ctx: ServerCtx) => {
  return SqliteStore<SessionId, UserId>({
    keySpace: "user-id-by-session-id",
    connectionString,
    decodeValue: (value) => {
      if (UserId.is(value)) {
        return value;
      }
      return null;
    },
    encodeValue: (value) => {
      return String(value);
    },
  });
};

export const StoreSessionIdByUserId = (_ctx: ServerCtx) => {
  return SqliteStore<UserId, { [sessionId: SessionId]: SessionId }>({
    keySpace: "session-id-by-user-id",
    connectionString,
    decodeValue: (value) => {
      if (typeof value === "object" && value !== null) {
        const sessionIds: { [sessionId: SessionId]: SessionId } = {};

        for (const key of Object.keys(value)) {
          if (SessionId.is(key)) {
            sessionIds[key] = key;
          }
        }

        return sessionIds;
      }

      return null;
    },
    encodeValue: (value) => {
      return String(value);
    },
  });
};
