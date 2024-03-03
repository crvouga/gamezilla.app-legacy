import { describe, expect, it } from "bun:test"
import { AppServerModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-server"
import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { didSendMsgToClient } from "gamezilla-app/@CHILD/app/@SHARED/server"
import {
  authenticatedClientConnected,
  clientSync,
  generateAuthClient,
  getDeps,
  init,
  userStartedSpace,
} from "../@TEST/server"
import { makeSpace } from "../@TEST/shared"

describe(import.meta.file, () => {
  it("should send user's space when they connect to the server", async () => {
    const deps = getDeps()
    const client = generateAuthClient()
    const spaceId = SpaceId.generate()
    const output = await AppServerModule.andThen(
      init(),
      userStartedSpace(deps, client, spaceId),
      authenticatedClientConnected(deps, client),
    )
    expect(
      didSendMsgToClient(output, (msg) => msg.t === "current-user-space"),
    ).toBeTrue()
  })

  it("should send back synced response when user sends sync message", async () => {
    const deps = getDeps()
    const client = generateAuthClient()
    const clientsSpace = makeSpace(SpaceId.generate(), client.userId)
    const output = await AppServerModule.andThen(
      init(),
      clientSync(deps, client, clientsSpace),
    )

    expect(didSendMsgToClient(output, (msg) => msg.t === "synced")).toBeTrue()
  })

  it("should broadcast space events received from clients to other clients", async () => {
    const deps = getDeps()
    const client = generateAuthClient()
    const spaceId = SpaceId.generate()
    const output = await AppServerModule.andThen(
      init(),
      userStartedSpace(deps, client, spaceId),
    )

    expect(
      didSendMsgToClient(
        output,
        (msg) => msg.t === "event" && msg.c.t === "user-started-space",
      ),
    ).toBeTrue()
  })
})
