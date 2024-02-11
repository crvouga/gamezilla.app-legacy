import { describe, it } from "bun:test"
import { ServerCtx } from "gamezilla/@CHILD/app/@SHARED/server"
import { dbConnNoop } from "gamezilla/@CHILD/app/@SHARED/server/db-conn-sql"
import { LoggerConsole } from "gamezilla/@CHILD/app/@SHARED/server/logger"
import { Posix } from "gamezilla/@SHARED/core"

const ctx: ServerCtx = {
  dbConn: dbConnNoop,
  logger: LoggerConsole("test"),
  now: Posix.now(),
}

describe("auth continue as guest client", () => {
  it("should request to continue as guest when button is clicked", async () => {
    // const output = await AuthServerMod.chainUpdates(AuthServer.init({ ctx }))
  })
})
