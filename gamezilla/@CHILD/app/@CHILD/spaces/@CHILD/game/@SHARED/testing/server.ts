import { SessionId, SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { dbConnNoop } from "gamezilla/@CHILD/app/@SHARED/server/db-conn-sql"
import { LoggerConsole } from "gamezilla/@CHILD/app/@SHARED/server/logger"
import { Posix } from "gamezilla/@SHARED/core"
import { SpaceServerCtx } from "../../../../@SHARED/space"

const hostUserId = "test-user-id" as UserId

const currentSpaceId = "test-space-id" as SpaceId

export const testSpaceServerCtx: SpaceServerCtx = {
  now: Posix.now(),
  dbConn: dbConnNoop,
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
