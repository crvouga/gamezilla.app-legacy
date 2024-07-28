import { describe, expect, it } from 'bun:test'
import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import { SpaceId } from 'gamezilla-app/app/@/data'
import { didSendMsgToClient } from 'gamezilla-app/app/@/server'
import { randomAuthenticatedClient, getDeps, init, userStartedSpace } from '../@/testing/server'
import { SpaceCore } from '../spaces-core'
import * as SpacesCoreServer from '../spaces-core/spaces-core.server'

describe(import.meta.file, () => {
  it('should add a new space when recieving a user started space event', async () => {
    const deps = await getDeps()
    const spaceId = SpaceId.generate()
    const client = randomAuthenticatedClient()

    await AppServerModule.andThen(init(), userStartedSpace(deps, client, spaceId))

    expect(SpaceCore.toSpaceId(await SpacesCoreServer.getSpaceById(deps.spaceCoreDb, spaceId))).toBe(spaceId)
  })

  it('should propogate the user started space event to the clients', async () => {
    const deps = await getDeps()
    const spaceId = SpaceId.generate()
    const client = randomAuthenticatedClient()

    const started = await AppServerModule.andThen(init(), userStartedSpace(deps, client, spaceId))

    expect(
      didSendMsgToClient(
        started,
        (msg) => msg.t === 'event' && msg.c.t === 'user-started-space' && msg.c.spaceId === spaceId
      )
    ).toBe(true)
  })
})
