import {Ok} from 'gamezilla-app/@/core';
import {IGuestSessionMappingDb} from './guest-session-mapping-db';
import {SessionId, UserId} from 'gamezilla-app/app/@/data';

export const GuestSessionMappingDbHashMap = (): IGuestSessionMappingDb => {
	const userIdBySessionId = new Map<SessionId, UserId>();
	const sessionIdByUserId = new Map<UserId, SessionId>();
	return {
		async findUserIdBySessionId(sessionId) {
			const userId =
				userIdBySessionId.get(
					sessionId,
				);
			return Ok(userId ?? null);
		},
		async insert(input) {
			userIdBySessionId.set(
				input.sessionId,
				input.guestUserId,
			);
			sessionIdByUserId.set(
				input.guestUserId,
				input.sessionId,
			);
			return Ok(null);
		},
	};
};
