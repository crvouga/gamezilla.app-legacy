import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Result, isOk } from "gamezilla/@SHARED/core";
import { ISessionDb } from "./session-db";

//
//
//
//
//

const userIdBySessionIdCache = new Map<SessionId, UserId>();
const sessionIdsByUserIdCache = new Map<UserId, SessionId[]>();

export const SessionDbWithCache = ({
  SessionDb,
}: {
  SessionDb: ISessionDb;
}): ISessionDb => {
  return {
    async findSessionIdsByUserId(userId: UserId) {
      const cachedSessionIds = sessionIdsByUserIdCache.get(userId);

      if (cachedSessionIds && cachedSessionIds.length > 0) {
        return Result.ok(cachedSessionIds);
      }

      const queried = await SessionDb.findSessionIdsByUserId(userId);

      if (isOk(queried)) {
        sessionIdsByUserIdCache.set(userId, queried.value);
      }

      return queried;
    },

    async findUserIdBySessionId(sessionId: SessionId) {
      const cachedUserId = userIdBySessionIdCache.get(sessionId);

      if (cachedUserId) {
        return Result.ok(cachedUserId);
      }

      const queried = await SessionDb.findUserIdBySessionId(sessionId);

      if (isOk(queried) && queried.value) {
        userIdBySessionIdCache.set(sessionId, queried.value);
      }

      return queried;
    },

    async insert({ sessionId, userId }) {
      const queried = await SessionDb.insert({ sessionId, userId });

      if (isOk(queried)) {
        userIdBySessionIdCache.set(sessionId, userId);
        const cachedSessionIds = sessionIdsByUserIdCache.get(userId);
        if (cachedSessionIds) {
          sessionIdsByUserIdCache.set(userId, [...cachedSessionIds, sessionId]);
        }
      }

      return queried;
    },

    async zapByUserId(userId) {
      const queried = await SessionDb.zapByUserId(userId);

      if (isOk(queried)) {
        sessionIdsByUserIdCache.delete(userId);
        for (const [
          sessionId,
          cachedUserId,
        ] of userIdBySessionIdCache.entries()) {
          if (cachedUserId === userId) {
            userIdBySessionIdCache.delete(sessionId);
          }
        }
      }

      return queried;
    },

    async zapBySessionId(sessionId) {
      const queried = await SessionDb.zapBySessionId(sessionId);

      if (isOk(queried)) {
        userIdBySessionIdCache.delete(sessionId);

        for (const [
          userId,
          cachedSessionIds,
        ] of sessionIdsByUserIdCache.entries()) {
          if (cachedSessionIds.includes(sessionId)) {
            sessionIdsByUserIdCache.set(
              userId,
              cachedSessionIds.filter((id) => id !== sessionId)
            );
          }
        }
      }

      return queried;
    },
  };
};
