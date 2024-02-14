import { describe, expect, it } from "bun:test"
import {
  authenticatedClientConncted,
  init,
  getDeps,
  generateAuthClient,
  userStartedSpace,
  clientSync,
} from "../@TEST/server"
import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server"
import { didSendMsgToClient } from "gamezilla/@CHILD/app/@SHARED/server"
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data"
import { makeSpace } from "../@TEST/shared"

describe("space server sync", () => {
  it("should send user's space when they connect to the server", async () => {
    const deps = getDeps()
    const client = generateAuthClient()
    const spaceId = SpaceId.generate()
    const output = await AppServerModule.chainUpdates(
      init(),
      userStartedSpace(deps, client, spaceId),
      authenticatedClientConncted(deps, client),
    )
    expect(
      didSendMsgToClient(output, (msg) => msg.t === "current-user-space"),
    ).toBeTrue()
  })

  it("should send back synced response when user sends sync message", async () => {
    const deps = getDeps()
    const client = generateAuthClient()
    const clientsSpace = makeSpace(SpaceId.generate(), client.userId)
    const output = await AppServerModule.chainUpdates(
      init(),
      clientSync(deps, client, clientsSpace),
    )

    expect(didSendMsgToClient(output, (msg) => msg.t === "synced")).toBeTrue()
  })
})
