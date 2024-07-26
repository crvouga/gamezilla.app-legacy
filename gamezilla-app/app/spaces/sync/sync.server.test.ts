import { describe, expect, it } from 'bun:test'
import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import { SpaceId } from 'gamezilla-app/app/@/data'
import { didSendMsgToClient } from 'gamezilla-app/app/@/server'
import {
  authenticatedClientConnected,
  clientCore,
  randomAuthenticatedClient,
  getDeps,
  init,
  userStartedSpace
} from '../@/testing/server'
import { makeSpace } from '../@/testing/shared'

describe(import.meta.file, () => {
  it("should send user's space when they connect to the server", async () => {
    const deps = await getDeps()
    const client = randomAuthenticatedClient()
    const spaceId = SpaceId.generate()
    const output = await AppServerModule.andThen(
      init(),
      userStartedSpace(deps, client, spaceId),
      authenticatedClientConnected(deps, client)
    )
    expect(didSendMsgToClient(output, (msg) => msg.t === 'current-user-space')).toBe(true)
  })

  it('should send back synced response when user sends sync message', async () => {
    const deps = await getDeps()
    const client = randomAuthenticatedClient()
    const clientsSpace = makeSpace({
      spaceId: SpaceId.generate(),
      hostId: client.userId
    })
    const output = await AppServerModule.andThen(init(), clientCore(deps, client, clientsSpace))

    expect(didSendMsgToClient(output, (msg) => msg.t === 'synced')).toBe(true)
  })

  it('should broadcast space events received from clients to other clients', async () => {
    const deps = await getDeps()
    const client = randomAuthenticatedClient()
    const spaceId = SpaceId.generate()
    const output = await AppServerModule.andThen(init(), userStartedSpace(deps, client, spaceId))

    expect(didSendMsgToClient(output, (msg) => msg.t === 'event' && msg.c.t === 'user-started-space')).toBe(true)
  })
})
