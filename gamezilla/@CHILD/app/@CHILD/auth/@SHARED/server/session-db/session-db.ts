import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla/@SHARED/core";
import { StoreInstance } from "gamezilla/@SHARED/immutable-store";

export type AuthSession = {
  sessionId: SessionId;
  userId: UserId;
};

export type IAuthSessionStoreInstance = StoreInstance<SessionId, AuthSession>;

export type IAuthSessionDb = {
  assoc: (
    now: Posix,
    store: IAuthSessionStoreInstance,
    session: AuthSession
  ) => Promise<null>;
  dissoc: (
    now: Posix,
    store: IAuthSessionStoreInstance,
    session: AuthSession
  ) => Promise<null>;
  findOneBySessionId: (
    now: Posix,
    sessionId: SessionId
  ) => Promise<AuthSession | null>;
};
