import { unwrap } from '~/@/result'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { UnixMs } from '~/@/time/unix-ms'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../../space'
import { initSpaceDb, SpaceDbConfig } from '../space-db-impl'
import { SpaceEntity } from '../space-entity'

const Fixture = async (config: SpaceDbConfig) => {
  const spacesDb = initSpaceDb(config)
  const spaceId = SpaceId.generate()
  const hostId = UserId.generate()
  const guestIds = [UserId.generate(), UserId.generate(), UserId.generate()]
  const userIds = [...guestIds, hostId]
  const space = Space.random({ spaceId, hostId, guestIds })

  const seedOtherSpaces = async (input: { count: number }) => {
    for (let i = 0; i < input.count; i++) {
      const randomSpace = Space.random({ spaceId: SpaceId.generate() })
      const spaceId = Space.toSpaceId(randomSpace)
      if (!spaceId) continue
      const spaceEntity: SpaceEntity = {
        id: spaceId,
        createdAt: UnixMs.now(),
        updatedAt: UnixMs.now(),
        deletedAt: null,
        space: randomSpace,
      }
      unwrap(await spacesDb.upsert({ entities: [spaceEntity] }))
    }
  }

  return {
    seedOtherSpaces,
    userIds,
    spacesDb,
    spaceId,
    space,
    hostId,
    guestIds,
  }
}

export const Fixtures = async () => {
  const f = await FixtureAppBackend()

  const configs: SpaceDbConfig[] = []

  configs.push({
    t: 'sql-db',
    sqlDb: f.sqlDbSqlite,
    logger: f.logger,
    kvDb: f.keyValueDbHashMap,
    migrationPolicy: SqlDbMigrationPolicy.init({ t: 'always-run', logger: f.logger }),
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql-db',
      sqlDb: f.sqlDbPostgres,
      logger: f.logger,
      kvDb: f.keyValueDbPostgres,
      migrationPolicy: SqlDbMigrationPolicy.init({ t: 'always-run', logger: f.logger }),
    })
  }

  return Promise.all(configs.map(Fixture))
}
