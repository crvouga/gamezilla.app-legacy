import { describe, it } from "bun:test"
import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server"
import { ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data"
import { ServerCtx } from "gamezilla/@CHILD/app/@SHARED/server"
import { dbConnNoop } from "gamezilla/@CHILD/app/@SHARED/server/db-conn-sql"
import { LoggerConsole } from "gamezilla/@CHILD/app/@SHARED/server/logger"
import { Posix } from "gamezilla/@SHARED/core"
import { AccountDb } from "../@SHARED/server/account-db"
import { SessionDb } from "../@SHARED/server/session-db"
import { ModelServer, ServerModule } from "../auth.core"
import * as AuthServer from "../auth.server"

const ctx: ServerCtx = {
  dbConn: dbConnNoop,
  logger: LoggerConsole("test"),
  now: Posix.now(),
}

const getDeps: ServerModule["getDeps"] = () => {
  return {
    AccountDb: AccountDb({ t: "in-memory" }),
    SessionDb: SessionDb({ t: "in-memory" }),
  }
}

const userClickedContinueAsGuestButton = async (model: ModelServer) => {
  return AuthServer.update({
    model,
    ctx,
    msgClient: {
      t: "guest.clicked-continue-as-guest-button",
      clientId: ClientId.generate(),
      sessionId: SessionId.generate(),
    },
    deps: getDeps({ ctx }),
  })
}

describe("auth continue as guest client", () => {
  it("should request to continue as guest when button is clicked", async () => {
    await AppServerModule.chainUpdates(
      AuthServer.init({ ctx }),
      userClickedContinueAsGuestButton,
    )

    // expect(
    //   didSendToClient(output, {
    //     t: "guest.clicked-continue-as-guest-button",
    //     result: ok(userId),
    //   }),
    // ).toBeTrue()
  })
})
