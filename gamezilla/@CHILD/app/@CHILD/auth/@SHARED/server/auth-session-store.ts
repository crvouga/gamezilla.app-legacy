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
  return SqliteStore<UserId, SessionId>({
    connectionString,
    keySpace: "auth/session-id-by-user-id",
    decodeValue: (encoded) => (SessionId.is(encoded) ? encoded : null),
    encodeValue: (value) => value,
  });
};
