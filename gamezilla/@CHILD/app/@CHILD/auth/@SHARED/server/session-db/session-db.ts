import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla/@SHARED/core";

type AuthSession = {
  sessionId: SessionId;
  userId: UserId;
};

export type ISessionDb = {
  assoc: (now: Posix, session: AuthSession) => Promise<null>;
  dissoc: (now: Posix, session: AuthSession) => Promise<null>;
  findOneBySessionId: (
    now: Posix,
    sessionId: SessionId
  ) => Promise<AuthSession | null>;
};
