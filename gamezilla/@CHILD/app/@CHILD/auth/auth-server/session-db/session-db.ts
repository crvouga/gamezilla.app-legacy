import { Posix, SessionId } from "gamezilla/@SHARED/core";
import { StoreInstance } from "gamezilla/@SHARED/immutable-store";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";

type AuthSession = {
  sessionId: SessionId;
  userId: UserId;
};

export type AuthSessionStoreInstance = StoreInstance<SessionId, AuthSession>;

export type AuthSessionStore = {
  assoc: (
    now: Posix,
    instance: AuthSessionStoreInstance,
    session: AuthSession
  ) => Promise<AuthSessionStoreInstance>;
  dissoc: (
    now: Posix,
    instance: AuthSessionStoreInstance,
    sessionId: SessionId
  ) => Promise<AuthSessionStoreInstance>;
  getBySessionId: (
    now: Posix,
    instance: AuthSessionStoreInstance,
    sessionId: SessionId
  ) => Promise<AuthSession | undefined>;
};
