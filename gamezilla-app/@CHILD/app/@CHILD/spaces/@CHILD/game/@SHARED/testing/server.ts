import {
  SessionId,
  SpaceId,
  UserId,
} from "gamezilla-app/@CHILD/app/@SHARED/data"
import { DbConnKvHashMap } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv/db-conn-kv-impl-hash-map"
import { dbConnSqlNoop } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-sql"
import { Posix } from "gamezilla-app/@SHARED/core"
import { SpaceServerCtx } from "../../../../@SHARED/space"
import { LoggerConsole } from "gamezilla-app/@CHILD/app/@SHARED/server/logger"
import { smsNoop } from "gamezilla-app/@CHILD/app/@SHARED/server/sms"

const hostUserId = "test-user-id" as UserId

const currentSpaceId = "test-space-id" as SpaceId

export const testSpaceServerCtx: SpaceServerCtx = {
  sms: smsNoop,
  now: Posix.now(),
  dbConnSql: dbConnSqlNoop,
  dbConnKv: DbConnKvHashMap(),
  logger: LoggerConsole("test-space"),
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
