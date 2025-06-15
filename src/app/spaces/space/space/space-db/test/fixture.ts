import { Sub } from '~/@/sub'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../..'
import { Config, SpaceDb } from '../impl'
import { SpaceDbInputMsg, SpaceDbOutputMsg } from '../interface'

const Fixture = async (config: Config) => {
  const input = Sub.create<SpaceDbInputMsg>()
  const output = Sub.create<SpaceDbOutputMsg>()
  const spacesDb = await SpaceDb({ ...config, input, output })
  const spaceId = SpaceId.generate()
  const space = Space.random({ spaceId: spaceId })

  return {
    input,
    output,
    spacesDb,
    spaceId,
    space,
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
