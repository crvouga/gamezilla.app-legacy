import { describe, expect, it } from 'bun:test'
import { Ok } from 'gamezilla-app/@/core'
import { DbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import * as SpaceCore from '../space-core'
import { SpaceCoreDb } from './space-core-db-impl'

const Fixture = async () => {
  const spacesDb = SpaceCoreDb({
    t: 'db-conn-kv',
    dbConnKv: await DbConnKv({
      t: 'hash-map'
    })
  })

  const spaceA = SpaceCore.random()

  return {
    spacesDb,
    spaceA
  }
}

describe(import.meta.file, () => {
  it('should work', async () => {
    const f = await Fixture()

    const spaceId = SpaceCore.toSpaceStarted(f.spaceA)?.spaceId ?? null

    const before = await f.spacesDb.get(spaceId)

    const upserted = await f.spacesDb.upsert(f.spaceA)

    const after = await f.spacesDb.get(spaceId)

    expect(before).toEqual(Ok(null))
    expect(upserted).toEqual(Ok(null))
    expect(after).toEqual(Ok(f.spaceA))
  })

  it('should be able to list spaces', async () => {
    const f = await Fixture()

    const before = await f.spacesDb.list({
      limit: 10,
      offset: 0
    })

    const upserted = await f.spacesDb.upsert(f.spaceA)

    const after = await f.spacesDb.list({
      limit: 10,
      offset: 0
    })

    expect(before).toEqual(Ok([]))
    expect(upserted).toEqual(Ok(null))
    expect(after).toEqual(Ok([f.spaceA]))
  })
})
