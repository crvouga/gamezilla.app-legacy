import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ServerCtx } from "gamezilla/@CHILD/app/@SHARED/server";
import { InMemoryStore } from "gamezilla/@SHARED/immutable-store";

export const StoreUserIdBySessionId = (_ctx: ServerCtx) => {
  return InMemoryStore<SessionId, UserId>({
    maxEntryCount: 100,
    decodeValue: (value) => {
      if (UserId.is(value)) {
        return value;
      }
      return null;
    },
    encodeValue: (value) => {
      return String(value);
    },
    namespace: "user-id-by-session-id",
  });
};

export const StoreSessionIdByUserId = (_ctx: ServerCtx) => {
  return InMemoryStore<UserId, { [sessionId: SessionId]: SessionId }>({
    maxEntryCount: 100,
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
    namespace: "session-id-by-user-id",
  });
};
