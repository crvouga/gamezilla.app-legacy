import { describe, it } from 'bun:test'
import { Sub } from '~/@/sub'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../../space'
import { Config, SpaceProjectionDb } from './impl'

const Fixture = async (config: Config) => {
  const _dangerouslyOverrideModel = Sub.create<Space.Model>()
  const spaceProjectionDb = await SpaceProjectionDb({
    ...config,
    _dangerouslyOverrideModel,
  })
  const spaceId = SpaceId.generate()
  const space = Space.random({ spaceId: spaceId })

  return {
    _dangerouslyOverrideModel,
    spaceProjectionDb: spaceProjectionDb,
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
  })

  if (f.t === 'integration') {
  }

  return Promise.all(configs.map(Fixture))
}

describe('SpaceProjectionDb', () => {
  it.todo('should work', async () => {})
})
