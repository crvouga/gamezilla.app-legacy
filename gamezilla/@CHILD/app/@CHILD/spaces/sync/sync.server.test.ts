import { describe, expect, it } from "bun:test"
import {
  clientAuthenticated,
  init,
  getDeps,
  generateAuthClient,
  userStartedSpace,
} from "../@TEST/server"
import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server"
import { didSendMsgToClient } from "gamezilla/@CHILD/app/@SHARED/server"
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data"

describe("space server sync", () => {
  it("send user's space when the connect to the server", async () => {
    const deps = getDeps()
    const client = generateAuthClient()
    const spaceId = SpaceId.generate()
    const output = await AppServerModule.chainUpdates(
      init(),
      userStartedSpace(deps, client, spaceId),
      clientAuthenticated(deps, client),
    )
    expect(
      didSendMsgToClient(output, (msg) => msg.t === "current-user-space"),
    ).toBeTrue()
  })
})
