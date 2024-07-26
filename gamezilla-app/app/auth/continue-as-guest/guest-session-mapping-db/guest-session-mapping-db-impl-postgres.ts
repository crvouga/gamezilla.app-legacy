import {Ok, Posix, isErr} from 'gamezilla-app/@/core';
import {IGuestSessionMappingDb} from './guest-session-mapping-db';
import {SessionId, UserId} from 'gamezilla-app/app/@/data';
import {p} from 'gamezilla-app/@/core/parser';
import {IDbConnSql} from 'gamezilla-app/app/@/server/db-conn-sql';

export const Row = p.obj({
	user_id: UserId,
	session_id: SessionId,
	created_at_posix: p.or(p.str, p.num),
});

export const GuestSessionMappingDbPostgres = (deps: {
	dbConnSql: IDbConnSql;
}): IGuestSessionMappingDb => {
	return {
		async findUserIdBySessionId(sessionId) {
			const query = `
				SELECT user_id
				FROM user_guest_session_mapping
				WHERE session_id = :session_id
				ORDER BY created_at_posix DESC
			`;
			const vars = {
				session_id: sessionId,
			};
			const queried =
				await deps.dbConnSql.query(
					p.obj(
						{
							user_id: UserId,
						},
					),
					query,
					vars,
				);

			if (isErr(queried)) {
				return queried;
			}

			const userId =
				queried.value[0]
					?.user_id ??
				null;

			return Ok(userId);
		},
		async insert(input) {
			const query = `
				INSERT INTO user_guest_session_mapping (user_id, session_id, created_at_posix)
				VALUES (:user_id, :session_id, :created_at_posix)
			`;
			const vars = {
				user_id: input.guestUserId,
				session_id: input.sessionId,
				created_at_posix: Posix.now(),
			};
			const inserted =
				await deps.dbConnSql.query(
					p.unknown,
					query,
					vars,
				);
			if (isErr(inserted)) {
				return inserted;
			}
			return Ok(null);
		},
	};
};
