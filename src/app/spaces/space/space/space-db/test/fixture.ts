import { unwrap } from '~/@/result'
import { Sub } from '~/@/sub'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { Space } from '../..'
import { Config, SpaceDb } from '../impl'
import { SpaceDbInputMsg, SpaceDbOutputMsg } from '../interface'

const Fixture = async (config: Config) => {
  const input = Sub.create<SpaceDbInputMsg>()
  const output = Sub.create<SpaceDbOutputMsg>()
  const spacesDb = await SpaceDb({ ...config, input, output })
  const spaceId = SpaceId.generate()
  const hostId = UserId.generate()
  const guestIds = [UserId.generate(), UserId.generate(), UserId.generate()]
  const userIds = [...guestIds, hostId]
  const space = Space.random({ spaceId, hostId, guestIds })

  const seedOtherSpaces = async (input: { count: number }) => {
    for (let i = 0; i < input.count; i++) {
      unwrap(await spacesDb.upsert(Space.random({ spaceId: SpaceId.generate() })))
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

  const configs: Config[] = []

  configs.push({
    t: 'sql-db',
    sqlDb: f.sqlDbSqlite,
    logger: f.logger,
    shouldCreateTable: true,
  })

  if (f.t === 'integration') {
    configs.push({
      t: 'sql-db',
      sqlDb: f.sqlDbPostgres,
      logger: f.logger,
      shouldCreateTable: false,
    })
  }

  return Promise.all(configs.map(Fixture))
}
