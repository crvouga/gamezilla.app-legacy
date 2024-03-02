import { describe, expect, it } from "test"
import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server"
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data"
import { didSendMsgToClient } from "gamezilla/@CHILD/app/@SHARED/server"
import {
  generateAuthClient,
  getDeps,
  init,
  userStartedSpace,
} from "../@TEST/server"
import { Spaces } from "../spaces-core"

describe(import.meta.file, () => {
  it("should add a new space when recieving a user started space event", async () => {
    const deps = getDeps()
    const spaceId = SpaceId.generate()
    const client = generateAuthClient()

    const started = await AppServerModule.chainUpdates(
      init(),
      userStartedSpace(deps, client, spaceId),
    )

    expect(Spaces.toSpaceIdByUserId(started.model, client.userId)).toBe(spaceId)
  })

  it("should propogate the user started space event to the clients", async () => {
    const deps = getDeps()
    const spaceId = SpaceId.generate()
    const client = generateAuthClient()

    const started = await AppServerModule.chainUpdates(
      init(),
      userStartedSpace(deps, client, spaceId),
    )

    expect(
      didSendMsgToClient(
        started,
        (msg) =>
          msg.t === "event" &&
          msg.c.t === "user-started-space" &&
          msg.c.spaceId === spaceId,
      ),
    ).toBeTrue()
  })
})
