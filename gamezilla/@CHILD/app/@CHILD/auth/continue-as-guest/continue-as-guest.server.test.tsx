import { describe, expect, it } from "bun:test"
import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server"
import { ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data"
import { ServerCtx } from "gamezilla/@CHILD/app/@SHARED/server"
import { dbConnNoop } from "gamezilla/@CHILD/app/@SHARED/server/db-conn-sql"
import { LoggerConsole } from "gamezilla/@CHILD/app/@SHARED/server/logger"
import { Posix } from "gamezilla/@SHARED/core"
import { AccountDb } from "../@SHARED/server/account-db"
import { SessionDb } from "../@SHARED/server/session-db"
import { ModelServer, ServerDeps, ServerModule } from "../auth.core"
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

const clientClickedContinueAsGuestButton =
  (deps: ServerDeps, clientId: ClientId, sessionId: SessionId) =>
  async (model: ModelServer) => {
    return AuthServer.update({
      model,
      ctx,
      msgClient: {
        t: "guest.clicked-continue-as-guest-button",
        clientId,
        sessionId,
      },
      deps,
    })
  }

const clientConnected =
  (deps: ServerDeps, clientId: ClientId, sessionId: SessionId) =>
  async (model: ModelServer) => {
    return AuthServer.update({
      model,
      ctx,
      msgEvt: { t: "wire/client-connected", clientId, sessionId },
      deps,
    })
  }

describe("auth continue as guest server", () => {
  it("should be able to handle request", async () => {
    const deps = getDeps({ ctx })

    const clientId = ClientId.generate()

    const output = await AppServerModule.chainUpdates(
      AuthServer.init({ ctx }),
      clientClickedContinueAsGuestButton(deps, clientId, SessionId.generate()),
    )

    expect(
      output.msgCmd?.some(
        (msgCmd) =>
          msgCmd.t === "wire" &&
          msgCmd.c.t === "send-to-client" &&
          msgCmd.c.clientIds.includes(clientId) &&
          msgCmd.c.msg.t === "guest.continue-as-guest-result",
      ),
    ).toBeTrue()
  })

  it("should output a client authenitcated event", async () => {
    const deps = getDeps({ ctx })

    const clientId = ClientId.generate()
    const sessionId = SessionId.generate()

    const output = await AppServerModule.chainUpdates(
      AuthServer.init({ ctx }),
      clientClickedContinueAsGuestButton(deps, clientId, sessionId),
    )

    expect(
      output.msgEvt?.some(
        (msgEvt) =>
          msgEvt.t === "auth/client-authenticated" &&
          msgEvt.clientId === clientId &&
          msgEvt.sessionId === sessionId &&
          msgEvt.loggedIn,
      ),
    ).toBeTrue()
  })

  it("should be able to find user id from session id after continuing as guest", async () => {
    const deps = getDeps({ ctx })

    const clientId = ClientId.generate()
    const sessionId = SessionId.generate()

    await AppServerModule.chainUpdates(
      AuthServer.init({ ctx }),
      clientClickedContinueAsGuestButton(deps, clientId, sessionId),
    )

    const userId = await AuthServer.toUserIdFromSessionId(deps, sessionId)

    expect(userId !== null).toBeTrue()
  })
})
