import { SessionId, UserId } from "gamezilla-app/@CHILD/app/@SHARED/data";
import { Result, isOk } from "gamezilla-app/@SHARED/core";
import { ISessionDb } from "./session-db";
//
//
//
//
//
const userIdBySessionId = new Map<SessionId, UserId>();
const sessionIdsByUserId = new Map<UserId, Set<SessionId>>();
export const SessionDbWithCache = ({ SessionDb, }: {
    SessionDb: ISessionDb;
}): ISessionDb => {
    return {
        async findSessionIdsByUserId(userId: UserId) {
            const cachedSessionIds = sessionIdsByUserId.get(userId);
            if (cachedSessionIds && cachedSessionIds.size > 0) {
                return Result.ok(Array.from(cachedSessionIds));
            }
            const queried = await SessionDb.findSessionIdsByUserId(userId);
            if (isOk(queried)) {
                sessionIdsByUserId.set(userId, new Set(queried.value));
            }
            return queried;
        },
        async findUserIdBySessionId(sessionId: SessionId) {
            const cachedUserId = userIdBySessionId.get(sessionId);
            if (cachedUserId) {
                return Result.ok(cachedUserId);
            }
            const queried = await SessionDb.findUserIdBySessionId(sessionId);
            if (isOk(queried) && queried.value) {
                userIdBySessionId.set(sessionId, queried.value);
            }
            return queried;
        },
        async insert({ sessionId, userId }) {
            const queried = await SessionDb.insert({ sessionId, userId });
            if (isOk(queried)) {
                userIdBySessionId.set(sessionId, userId);
                const cachedSessionIds = sessionIdsByUserId.get(userId);
                if (cachedSessionIds) {
                    cachedSessionIds.add(sessionId);
                    sessionIdsByUserId.set(userId, cachedSessionIds);
                }
            }
            return queried;
        },
        async zapByUserId(userId) {
            const queried = await SessionDb.zapByUserId(userId);
            if (isOk(queried)) {
                sessionIdsByUserId.delete(userId);
                for (const [sessionId, cachedUserId] of userIdBySessionId.entries()) {
                    if (cachedUserId === userId) {
                        userIdBySessionId.delete(sessionId);
                    }
                }
            }
            return queried;
        },
        async zapBySessionId(sessionId) {
            const queried = await SessionDb.zapBySessionId(sessionId);
            if (isOk(queried)) {
                userIdBySessionId.delete(sessionId);
                for (const [userId, cachedSessionIds] of sessionIdsByUserId.entries()) {
                    if (cachedSessionIds.has(sessionId)) {
                        cachedSessionIds.delete(sessionId);
                        sessionIdsByUserId.set(userId, cachedSessionIds);
                    }
                }
            }
            return queried;
        },
    };
};
