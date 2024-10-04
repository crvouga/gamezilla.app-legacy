import { describe, expect, it } from 'bun:test'
import { unwrap } from 'gamezilla-app/@/core'
import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import { SpaceId } from 'gamezilla-app/app/@/data'
import { didSendMsgToClient } from 'gamezilla-app/app/@/server'
import { init, initDeps, randomAuthenticatedClient, userStartedSpace } from '../@/fixture/server'
import { SpaceCore } from '../spaces-core'

describe(import.meta.file, () => {
  it('should add a new space when receiving a user started space event', async () => {
    const deps = await initDeps()
    const spaceId = SpaceId.generate()
    const client = randomAuthenticatedClient()

    await AppServerModule.andThen(init(), userStartedSpace(deps, client, spaceId))

    const got = unwrap(await deps.spacesCoreServer.get(spaceId)) ?? SpaceCore.init

    expect(SpaceCore.toSpaceId(got)).toBe(spaceId)
  })

  it('should propagate the user started space event to the clients', async () => {
    const deps = await initDeps()
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
