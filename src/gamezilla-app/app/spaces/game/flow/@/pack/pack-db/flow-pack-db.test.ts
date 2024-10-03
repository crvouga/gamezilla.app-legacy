import { describe, expect, it } from 'bun:test'
import { Ok, Result } from 'gamezilla-app/@/core'
import { UserId } from 'gamezilla-app/app/@/data'
import { AppServerTestEnv } from 'gamezilla-app/app/@/server/server-test-env'
import { FlowPuzzleId } from '../../flow-puzzle/flow-puzzle-id'
import { FlowPack } from '../pack'
import { FlowPackName } from '../pack-name'
import { FlowPackDb } from './flow-pack-db-impl'

const Fixture = async () => {
  const testEnv = await AppServerTestEnv()
  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      const flowPackDb = FlowPackDb({
        t: 'db-conn-sql',
        dbConnSql: testEnv.dbConnSql
      })

      return {
        flowPackDb
      }
    }

    case 'unit': {
      const flowPackDb = FlowPackDb({
        t: 'hash-map'
      })

      return {
        flowPackDb
      }
    }
  }
}

describe(import.meta.file, () => {
  it('should be able to put', async () => {
    const f = await Fixture()
    const pack = await FlowPack.random()
    const put = await f.flowPackDb.put(pack)
    expect(put.t).toBe('ok')
  })

  it('should be able to get', async () => {
    const f = await Fixture()
    const pack = await FlowPack.random()
    const before = await f.flowPackDb.get(pack.id)
    await f.flowPackDb.put(pack)
    const after = await f.flowPackDb.get(pack.id)
    expect(before).toEqual(Ok(null))
    expect(after).toEqual(Ok(pack))
  })

  it('should be able to list', async () => {
    const f = await Fixture()
    const pack = await FlowPack.random()
    await f.flowPackDb.put(pack)
    const listed = await f.flowPackDb.list({
      order: {
        createdAt: 'asc'
      },
      pagination: {
        limit: 10,
        offset: 0
      },
      where: {
        createdBy: pack.createdBy
      }
    })
    expect(listed.t).toBe('ok')
    if (listed.t === 'ok') {
      expect(listed.value.items).toEqual([pack])
      expect(listed.value.total).toEqual(1)
    }
  })

  it('should be able to filter by created by', async () => {
    const f = await Fixture()
    const createdBy = UserId.generate()
    const pack = await FlowPack.random({
      createdBy
    })
    await f.flowPackDb.put(pack)

    for (let i = 0; i < 10; i++) {
      const other = await FlowPack.random()
      await f.flowPackDb.put(other)
    }

    const listed = await f.flowPackDb.list({
      order: {
        createdAt: 'asc'
      },
      pagination: {
        limit: 10,
        offset: 0
      },
      where: {
        createdBy: pack.createdBy
      }
    })
    expect(listed.t).toBe('ok')
    if (listed.t === 'ok') {
      expect(listed.value.items).toEqual([pack])
      expect(listed.value.total).toEqual(1)
    }
  })

  it('should be able to count', async () => {
    const f = await Fixture()
    const pack = await FlowPack.random()
    await f.flowPackDb.put(pack)
    const count = await f.flowPackDb.count({
      where: {
        createdBy: pack.createdBy
      }
    })
    expect(count).toEqual(Ok(1))
  })

  it('should be able to zap', async () => {
    const f = await Fixture()
    const pack = await FlowPack.random()
    await f.flowPackDb.put(pack)
    const zapped = await f.flowPackDb.zap({
      deletedBy: pack.createdBy,
      id: pack.id
    })
    const after = await f.flowPackDb.get(pack.id)
    expect(zapped).toEqual(Ok(null))
    expect(after).toEqual(Ok(null))
  })

  it('should be able to update', async () => {
    const f = await Fixture()
    const pack = await FlowPack.random()
    await f.flowPackDb.put(pack)
    const before = Result.withDefault(await f.flowPackDb.get(pack.id), null)
    const updated: FlowPack = {
      ...pack,
      name: await FlowPackName.generate({
        count: 1
      }),
      puzzleIds: [FlowPuzzleId.generate(), FlowPuzzleId.generate()]
    }
    await f.flowPackDb.put(updated)
    const after = Result.withDefault(await f.flowPackDb.get(pack.id), null)
    expect(before).toEqual(pack)
    expect(after).toEqual(updated)
  })
})
