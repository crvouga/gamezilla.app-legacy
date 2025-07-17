import { Logger } from '~/@/logger'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy'
import { Ok, Result, unwrap } from '~/@/result'
import { describe, expect, test } from '~/@/test-runner'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { UserId } from '~/app/@/data/user-id'
import { PuzzleId } from '../../puzzle/puzzle-id'
import { Pack } from '../pack'
import { PackName } from '../pack-name'
import { Config, PackDb } from './impl'

const Fixture = (config: Config) => {
  const packDb = PackDb(config)
  return {
    packDb,
  }
}

const Fixtures = async () => {
  const f = await FixtureAppBackend()
  const configs: Config[] = []

  configs.push({
    t: 'hash-map',
  })

  configs.push({
    t: 'sql-db',
    sqlDb: f.sqlDbSqlite,
    logger: Logger({ t: 'console', namespace: ['pack-db'], newLinePerMsg: false, maxLogLevel: 'info' }),
    migrationPolicy: SqlDbMigrationPolicy({ t: 'always-run', logger: Logger({ t: 'noop' }) }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql-db',
      sqlDb: f.sqlDbPostgres,
      logger: Logger({ t: 'console', namespace: ['pack-db'], newLinePerMsg: false, maxLogLevel: 'info' }),
      migrationPolicy: SqlDbMigrationPolicy({ t: 'always-run', logger: Logger({ t: 'noop' }) }),
    })
  }

  return Promise.all(configs.map(Fixture))
}

describe(`PackDb`, () => {
  test('should be able to put', async () => {
    for (const f of await Fixtures()) {
      const pack = await Pack.random()
      const put = await f.packDb.put(pack)
      expect(put).toEqual(Ok(pack))
    }
  })

  test('should be able to get', async () => {
    for (const f of await Fixtures()) {
      const pack = await Pack.random()
      const before = await f.packDb.get(pack.id)
      unwrap(await f.packDb.put(pack))
      const after = await f.packDb.get(pack.id)
      expect(before).toEqual(Ok(null))
      expect(after).toEqual(Ok(pack))
    }
  })

  test('should be able to list', async () => {
    for (const f of await Fixtures()) {
      const pack = await Pack.random()
      const put = await f.packDb.put(pack)
      expect(put).toEqual(Ok(pack))

      const listed = await f.packDb.list({
        order: {
          createdAt: 'asc',
        },
        pagination: {
          limit: 10,
          offset: 0,
        },
        where: {
          createdBy: {
            equals: pack.createdBy,
          },
        },
      })
      expect(listed.t).toEqual('ok')
      if (listed.t === 'ok') {
        expect(listed.value.items).toEqual([pack])
        expect(listed.value.total).toEqual(1)
      }
    }
  })

  test('should be able to filter by created by', async () => {
    for (const f of await Fixtures()) {
      const createdBy = UserId.generate()
      const pack = await Pack.random({
        createdBy,
      })
      unwrap(await f.packDb.put(pack))

      for (let i = 0; i < 10; i++) {
        const other = await Pack.random()
        unwrap(await f.packDb.put(other))
      }

      const listed = await f.packDb.list({
        order: {
          createdAt: 'asc',
        },
        pagination: {
          limit: 10,
          offset: 0,
        },
        where: {
          createdBy: {
            equals: pack.createdBy,
          },
        },
      })
      expect(listed.t).toEqual('ok')
      if (listed.t === 'ok') {
        expect(listed.value.items).toEqual([pack])
        expect(listed.value.total).toEqual(1)
      }
    }
  })

  test('should be able to count', async () => {
    for (const f of await Fixtures()) {
      const pack = await Pack.random()
      unwrap(await f.packDb.put(pack))
      const count = await f.packDb.count({
        where: {
          createdBy: {
            equals: pack.createdBy,
          },
        },
      })
      expect(count).toEqual(Ok(1))
    }
  })

  test('should be able to zap', async () => {
    for (const f of await Fixtures()) {
      const pack = await Pack.random()
      await f.packDb.put(pack)
      const zapped = await f.packDb.zap({
        deletedBy: pack.createdBy,
        id: pack.id,
      })
      const after = await f.packDb.get(pack.id)
      expect(zapped).toEqual(Ok(null))
      expect(after).toEqual(Ok(null))
    }
  })

  test('should be able to zap and verify using list', async () => {
    for (const f of await Fixtures()) {
      const pack = await Pack.random()
      await f.packDb.put(pack)
      const zapped = await f.packDb.zap({
        deletedBy: pack.createdBy,
        id: pack.id,
      })
      const listed = await f.packDb.list({
        order: { createdAt: 'asc' },
        pagination: { limit: 10, offset: 0 },
        where: { createdBy: { equals: pack.createdBy } },
      })
      expect(zapped).toEqual(Ok(null))
      expect(listed.t).toEqual('ok')
      if (listed.t === 'ok') {
        expect(listed.value.items).toEqual([])
        expect(listed.value.total).toEqual(0)
      }
    }
  })

  test('should be able to update', async () => {
    for (const f of await Fixtures()) {
      const pack = await Pack.random()

      unwrap(await f.packDb.put(pack))

      const before = Result.unwrapOr(await f.packDb.get(pack.id), null)
      const updated: Pack = {
        ...pack,
        name: await PackName.generate(),
        puzzleIds: [PuzzleId.generate(), PuzzleId.generate()],
      }

      unwrap(await f.packDb.put(updated))

      const after = Result.unwrapOr(await f.packDb.get(pack.id), null)

      expect(before).toEqual(pack)
      expect(after).toEqual(updated)
    }
  })

  test('updates should be independent', async () => {
    for (const f of await Fixtures()) {
      const packA = await Pack.random()
      const packB = await Pack.random()
      unwrap(await f.packDb.put(packA))
      const beforeInsert = unwrap(await f.packDb.get(packA.id))
      unwrap(await f.packDb.put(packB))
      const beforeUpdate = unwrap(await f.packDb.get(packA.id))
      const packBUpdated: Pack = {
        ...(await Pack.random()),
        id: packB.id,
      }
      unwrap(await f.packDb.put(packBUpdated))
      const afterUpdate = unwrap(await f.packDb.get(packA.id))

      expect(beforeInsert).toEqual(packA)
      expect(beforeUpdate).toEqual(packA)
      expect(afterUpdate).toEqual(packA)
    }
  })
})
