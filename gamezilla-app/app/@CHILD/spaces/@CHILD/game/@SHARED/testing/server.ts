import { SessionId, SpaceId, UserId } from "gamezilla-app/app/@SHARED/data"
import { DbConnKvHashMap } from "gamezilla-app/app/@SHARED/server/db-conn-kv/db-conn-kv-impl-hash-map"
import { dbConnSqlNoop } from "gamezilla-app/app/@SHARED/server/db-conn-sql"
import { Posix } from "gamezilla-app/@SHARED/core"
import { SpaceServerCtx } from "../../../../@SHARED/space"

import { smsNoop } from "gamezilla-app/app/@SHARED/server/sms"
import { Logger } from "gamezilla-app/app/@SHARED/server/logger/logger-impl"

const hostUserId = "test-user-id" as UserId

const currentSpaceId = "test-space-id" as SpaceId

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
}
