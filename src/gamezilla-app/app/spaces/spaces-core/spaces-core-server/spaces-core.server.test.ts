import { describe, expect, it } from 'bun:test'
import { SpaceId, UserId } from 'gamezilla-app/app/@/data'
import { DbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { withId } from '../../@/event'
import { SpacesDb } from './spaces-core-db/spaces-core-db-impl'
import { SpacesCoreServer } from './spaces-core.server'

const Fixture = async () => {
  const spacesDb = SpacesDb({
    t: 'db-conn-kv',
    dbConnKv: await DbConnKv({
      t: 'hash-map'
    })
  })
  return {
    spacesDb,
    spaceId: SpaceId.generate(),
    userId: UserId.generate(),
    spaceEvent: withId({
      t: 'user-started-space',
      spaceId: SpaceId.generate(),
      userId: UserId.generate()
    })
  }
}

describe(import.meta.file, () => {
  it('should work', async () => {
    const spaceId = SpaceId.generate()
    const f = await Fixture()
    const before = await SpacesCoreServer.getSpaceStarted(f.spacesDb, spaceId)
    await SpacesCoreServer.update(
      f.spacesDb,
      withId({
        t: 'user-started-space',
        spaceId: spaceId,
        userId: UserId.generate()
      })
    )
    const after = await SpacesCoreServer.getSpaceStarted(f.spacesDb, spaceId)
    expect(before).toEqual(null)
    expect(after?.spaceId).toEqual(spaceId)
  })
})
