import { Ok } from "gamezilla-app/@shared/core";
import type { SessionId, UserId } from "gamezilla-app/app/@shared/data";
import type { ISessionDb } from "./session-db";

const sessionIdsByUserId = new Map<UserId, SessionId[]>();
const userIdBySessionId = new Map<SessionId, UserId>();

export const SessionDbInMemory = ({
	delay,
}: {
	delay: () => Promise<void>;
}): ISessionDb => {
	return {
		async findSessionIdsByUserId(userId: UserId) {
			await delay();
			const sessionIds = sessionIdsByUserId.get(userId);
			return Ok(sessionIds ?? []);
		},
		async findUserIdBySessionId(sessionId: SessionId) {
			await delay();
			const userId = userIdBySessionId.get(sessionId);
			return Ok(userId ?? null);
		},
		async insert({ sessionId, userId }) {
			await delay();
			const sessionIds = sessionIdsByUserId.get(userId) ?? [];
			sessionIds.push(sessionId);
			sessionIdsByUserId.set(userId, sessionIds);
			userIdBySessionId.set(sessionId, userId);
			return Ok(null);
		},
		async zapByUserId(userId) {
			await delay();
			const sessionIds = sessionIdsByUserId.get(userId) ?? [];
			for (const sessionId of sessionIds) {
				userIdBySessionId.delete(sessionId);
			}
			sessionIdsByUserId.delete(userId);
			return Ok(null);
		},
		async zapBySessionId(sessionId) {
			await delay();
			const userId = userIdBySessionId.get(sessionId);
			if (userId) {
				const sessionIds = sessionIdsByUserId.get(userId) ?? [];
				const idx = sessionIds.indexOf(sessionId);
				if (idx >= 0) {
					sessionIds.splice(idx, 1);
				}
				userIdBySessionId.delete(sessionId);
			}
			return Ok(null);
		},
	};
};
