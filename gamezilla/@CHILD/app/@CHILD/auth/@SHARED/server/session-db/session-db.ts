import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Result } from "gamezilla/@SHARED/core";

export type ISessionDb = {
  find: (input: {
    where: {
      sessionId?: SessionId;
      userId?: UserId;
    };
  }) => Promise<
    Result<string, { sessionId: SessionId; userId: UserId } | null>
  >;
  put: (input: {
    sessionId: SessionId;
    userId: UserId;
  }) => Promise<Result<string, null>>;
};
