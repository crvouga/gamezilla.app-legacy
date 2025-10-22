import { unwrap } from '~/@/result'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../../space'
import { SpaceDb } from '../impl'

const Fixture = async (config: SpaceDb) => {
  const spacesDb = SpaceDb.init(config)
  const spaceId = SpaceId.generate()
  const hostId = UserId.generate()
  const guestIds = [UserId.generate(), UserId.generate(), UserId.generate()]
  const userIds = [...guestIds, hostId]
  const space = Space.random({ spaceId, hostId, guestIds })

  const seedOtherSpaces = async (input: { count: number }) => {
    for (let i = 0; i < input.count; i++) {
      unwrap(await spacesDb.upsert({ entities: [Space.random({ spaceId: SpaceId.generate() })] }))
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

  const configs: SpaceDb[] = []

  configs.push({
    t: 'sql-db',
    sqlDb: f.sqlDbSqlite,
    logger: f.logger,
    kvDb: f.kvDb,
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql-db',
      sqlDb: f.sqlDbPostgres,
      logger: f.logger,
      kvDb: f.kvDb,
    })
  }

  return Promise.all(configs.map(Fixture))
}
