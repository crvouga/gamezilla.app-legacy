import { describe, expect, it } from "bun:test"
import { AppServerModule } from "gamezilla-app/app/@SHARED/architecture/app-server"
import { SpaceId } from "gamezilla-app/app/@SHARED/data"
import { didSendMsgToClient } from "gamezilla-app/app/@SHARED/server"
import {
  generateAuthClient,
  getDeps,
  init,
  userStartedSpace,
} from "../@SHARED/testing/server"
import { Space } from "../spaces-core"
import { SpacesCoreServer } from "../spaces-core/spaces-core.server"

describe(import.meta.file, () => {
  it("should add a new space when recieving a user started space event", async () => {
    const deps = getDeps()
    const spaceId = SpaceId.generate()
    const client = generateAuthClient()

    await AppServerModule.andThen(
      init(),
      userStartedSpace(deps, client, spaceId),
    )

    expect(
      Space.toSpaceId(
        await SpacesCoreServer.getSpaceById(deps.SpacesDb, spaceId),
      ),
    ).toBe(spaceId)
  })

  it("should propogate the user started space event to the clients", async () => {
    const deps = getDeps()
    const spaceId = SpaceId.generate()
    const client = generateAuthClient()

    const started = await AppServerModule.andThen(
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
    ).toBe(true)
  })
})
