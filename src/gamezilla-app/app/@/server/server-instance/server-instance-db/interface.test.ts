import { describe, expect, test } from 'bun:test'
import { AppServerTestEnv } from '../../server-test-env'
import { Config } from './impl'
import { ServerInstanceDb } from './impl-db-conn-kv'
import { ServerInstance } from '../server-instance'
import { Ok } from 'gamezilla-app/@/core'

const Fixture = (config: Config) => {
  const serverInstanceDb = ServerInstanceDb(config)
  return {
    serverInstanceDb
  }
}

const Fixtures = async () => {
  const f = await AppServerTestEnv()

  const configs: Config[] = [
    {
      t: 'db-conn-kv',
      dbConnKv: f.dbConnKv
    }
  ]

  return configs.map(Fixture)
}

describe(import.meta.file, () => {
  test('put and get', async () => {
    for (const f of await Fixtures()) {
      const serverInstance = ServerInstance.random()
      const before = await f.serverInstanceDb.get(serverInstance.serverInstanceId)
      const put = await f.serverInstanceDb.put(serverInstance)
      const after = await f.serverInstanceDb.get(serverInstance.serverInstanceId)
      expect(before).toEqual(Ok(null))
      expect(put).toEqual(Ok(null))
      expect(after).toEqual(Ok(serverInstance))
    }
  })

  test('list', async () => {
    for (const f of await Fixtures()) {
      const before = await f.serverInstanceDb.list()
      const expected: ServerInstance[] = []
      for (let i = 0; i < 10; i++) {
        const serverInstance = ServerInstance.random()
        expected.push(serverInstance)
        await f.serverInstanceDb.put(serverInstance)
      }
      const after = await f.serverInstanceDb.list()
      expect(before).toEqual(Ok([]))
      expect(after).toEqual(Ok(expected))
    }
  })
})
