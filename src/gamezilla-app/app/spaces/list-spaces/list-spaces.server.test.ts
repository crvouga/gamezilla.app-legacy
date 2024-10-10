import { describe, expect, it } from 'bun:test'
import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import { SpaceId } from 'gamezilla-app/app/@/data'
import { didSendMsgToClient } from 'gamezilla-app/app/@/server'
import { FixtureSpaceServer, userStartedSpace } from '../@/fixture/server'
import * as SpacesServer from '../spaces.server'

const clientAListSpaces = (f: Awaited<ReturnType<typeof FixtureSpaceServer>>) => () => {
  return SpacesServer.update({
    ctx: f.ctx,
    deps: f.deps,
    msgClient: {
      t: 'list-spaces',
      clientId: f.clientA.clientId,
      sessionId: f.clientA.sessionId,
      limit: 10,
      offset: 0
    }
  })
}

describe(import.meta.file, () => {
  it('should list spaces when requested', async () => {
    const f = await FixtureSpaceServer()
    const spaceId = SpaceId.generate()
    const output = await AppServerModule.andThen({}, userStartedSpace(f.deps, f.clientA, spaceId), clientAListSpaces(f))
    expect(didSendMsgToClient(output, (msg) => msg.t === 'listed-spaces')).toBe(true)
  })

  it('should include the started space in the response', async () => {
    const f = await FixtureSpaceServer()
    const spaceId = SpaceId.generate()
    const output = await AppServerModule.andThen({}, userStartedSpace(f.deps, f.clientA, spaceId), clientAListSpaces(f))
    expect(
      didSendMsgToClient(
        output,
        (msg) =>
          msg.t === 'listed-spaces' &&
          msg.spaces.some((space) => space.events.some((event) => event.spaceId === spaceId))
      )
    ).toBe(true)
  })
})
