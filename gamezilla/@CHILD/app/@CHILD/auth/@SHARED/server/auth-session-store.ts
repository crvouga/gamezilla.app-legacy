import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ServerCtx } from "gamezilla/@CHILD/app/@SHARED/server";
import { InMemoryStore } from "gamezilla/@SHARED/immutable-store";

export const StoreUserIdBySessionId = (_ctx: ServerCtx) => {
  return InMemoryStore<SessionId, UserId>({
    maxEntryCount: 100,
  });
};

export const StoreSessionIdByUserId = (_ctx: ServerCtx) => {
  return InMemoryStore<UserId, { [sessionId: SessionId]: SessionId }>({
    maxEntryCount: 100,
  });
};
