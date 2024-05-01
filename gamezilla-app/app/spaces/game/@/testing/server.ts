import {
	SessionId,
	type SpaceId,
	type UserId,
} from "gamezilla-app/app/@/data";
import { DbConnKvHashMap } from "gamezilla-app/app/@/server/db-conn-kv/db-conn-kv-impl-hash-map";
import { dbConnSqlNoop } from "gamezilla-app/app/@/server/db-conn-sql";
import { Posix } from "gamezilla-app/@/core";
import type { SpaceServerCtx } from "../../../@/space";

import { smsNoop } from "gamezilla-app/app/@/server/sms";
import { Logger } from "gamezilla-app/app/@/server/logger/logger-impl";

const hostUserId = "test-user-id" as UserId;

const currentSpaceId = "test-space-id" as SpaceId;

export const testSpaceServerCtx: SpaceServerCtx = {
	sms: smsNoop,
	now: Posix.now(),
	dbConnSql: dbConnSqlNoop,
	dbConnKv: DbConnKvHashMap(),
	logger: Logger({ t: "noop" }),
	sessionId: SessionId.generate(),
	space: {
		hostId: hostUserId,
		spaceId: currentSpaceId,
		users: {
			[hostUserId]: hostUserId,
		},
		visibility: "public",
	},
};
