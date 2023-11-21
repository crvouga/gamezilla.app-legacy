import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { SqliteStore } from "gamezilla/@SHARED/immutable-store";

const databaseUrl = "sqlite:data/gamezilla.db";

export const StoreUserIdBySessionId = SqliteStore<SessionId, UserId>({
  connectionString: databaseUrl,
  keySpace: "auth/user-id-by-session-id",
  decodeValue: (encoded) => (UserId.is(encoded) ? encoded : null),
  encodeValue: (value) => value,
});

export const StoreSessionIdByUserId = SqliteStore<UserId, SessionId>({
  connectionString: databaseUrl,
  keySpace: "auth/session-id-by-user-id",
  decodeValue: (encoded) => (SessionId.is(encoded) ? encoded : null),
  encodeValue: (value) => value,
});
