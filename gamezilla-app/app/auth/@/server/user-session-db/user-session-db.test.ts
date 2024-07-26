import {describe, expect, it} from 'bun:test';
import {AppServerTestEnv} from 'gamezilla-app/app/@/server/server-test-env';
import {UserSessionDb} from './user-session-db-impl';
import {SessionId, UserId} from 'gamezilla-app/app/@/data';
import {unwrap} from 'gamezilla-app/@/core';

const FixtureVariant = async () => {
	const testEnv = await AppServerTestEnv();
	switch (testEnv.t) {
		case 'integration': {
			return {
				userSessionDb: UserSessionDb(
					{
						t: 'postgres-with-db-kv-cache',
						dbConnKv: testEnv.dbConnKv,
						dbConnSql: testEnv.dbConnSql,
					},
				),
			};
		}

		case 'unit': {
			return {
				userSessionDb: UserSessionDb(
					{
						t: 'in-memory',
						delay: async () => {},
					},
				),
			};
		}
	}
};

const Fixture = async () => {
	const f = await FixtureVariant();
	const userId = UserId.generate();
	const sessions = [
		{
			sessionId: SessionId.generate(),
			userId,
		},
		{
			sessionId: SessionId.generate(),
			userId,
		},
		{
			sessionId: SessionId.generate(),
			userId,
		},
		{
			sessionId: SessionId.generate(),
			userId: UserId.generate(),
		},
		{
			sessionId: SessionId.generate(),
			userId: UserId.generate(),
		},
		{
			sessionId: SessionId.generate(),
			userId: UserId.generate(),
		},
	] as const;
	for (const session of sessions) {
		await f.userSessionDb.insert(session);
	}
	return {
		...f,
		userId,
		sessions,
	};
};

describe(import.meta.file, () => {
	it('should insert correctly', async () => {
		const f = await Fixture();
		const session = {
			sessionId: SessionId.generate(),
			userId: UserId.generate(),
		};
		const before =
			await f.userSessionDb.findUserIdBySessionId(
				session.sessionId,
			);
		const inserted = await f.userSessionDb.insert(
			session,
		);
		const after =
			await f.userSessionDb.findUserIdBySessionId(
				session.sessionId,
			);
		expect(unwrap(before)).toBe(null);
		expect(inserted.t).toBe('ok');
		expect(unwrap(after)).toBe(session.userId);
	});

	it('should find session ids by user id', async () => {
		const f = await Fixture();
		const sessionIds =
			await f.userSessionDb.findSessionIdsByUserId(
				f.userId,
			);
		expect(sessionIds.t).toBe('ok');
		const expected = f.sessions
			.filter(
				(s) =>
					s.userId ===
					f.userId,
			)
			.map((s) => s.sessionId);
		expect(unwrap(sessionIds)).toEqual(expected);
	});

	it('should be able to zap by user id', async () => {
		const f = await Fixture();
		const before =
			await f.userSessionDb.findSessionIdsByUserId(
				f.userId,
			);
		await f.userSessionDb.zapByUserId(f.userId);
		const after =
			await f.userSessionDb.findSessionIdsByUserId(
				f.userId,
			);

		expect(unwrap(before)).toEqual(
			f.sessions
				.filter(
					(
						s,
					) =>
						s.userId ===
						f.userId,
				)
				.map(
					(
						s,
					) =>
						s.sessionId,
				),
		);
		expect(after.t).toBe('ok');
		expect(unwrap(after)).toEqual([]);
	});

	it('should be able to zap by session id', async () => {
		const f = await Fixture();
		await f.userSessionDb.zapBySessionId(
			f.sessions[0].sessionId,
		);
		const sessionIds =
			await f.userSessionDb.findSessionIdsByUserId(
				f.userId,
			);
		expect(sessionIds.t).toBe('ok');
		const expected = f.sessions
			.filter(
				(s) =>
					s.userId ===
						f.userId &&
					s.sessionId !==
						f
							.sessions[0]
							.sessionId,
			)
			.map((s) => s.sessionId);
		expect(unwrap(sessionIds)).toEqual(expected);
	});
});
