import { Ok } from '~/@/result'
import { s } from '~/@/schema'
import { describe, expect, test } from '~/@/test-runner'
import { Uuid } from '../id/uuid'
import { Logger } from '../logger'
import { KeyValueDbSync } from './impl'
import { IKeyValueDbSync } from './interface'

type Fixture = {
  name: string
  keyValueDb: IKeyValueDbSync
}
const Fixtures = async (): Promise<Fixture[]> => {
  const logger = Logger.init({ t: 'noop' })

  const fixtures: Fixture[] = []

  fixtures.push({
    name: 'hash-map',
    keyValueDb: KeyValueDbSync.init({
      t: 'hash-map',
      logger,
    }),
  })

  fixtures.push({
    name: 'hash-map-with-logger',
    keyValueDb: KeyValueDbSync.init({
      t: 'hash-map',
      logger,
    }),
  })

  fixtures.push({
    name: 'web-standard-storage',
    keyValueDb: KeyValueDbSync.init({
      t: 'web-standard-storage',
      storage: window.localStorage,
      logger,
    }),
  })

  return fixtures
}

const Item = s.obj({ id: s.str() })

type Item = s.Infer<typeof Item>

const randomItem = (): Item => {
  return {
    id: Uuid.generate(),
  }
}

describe(`KeyValueDb`, () => {
  test('should set correctly', async () => {
    const fixtures = await Fixtures()
    for (const fixture of fixtures) {
      const item = randomItem()

      const before = fixture.keyValueDb.get(item.id, Item)
      fixture.keyValueDb.set(item.id, item)
      const after = fixture.keyValueDb.get(item.id, Item)

      expect(before).toEqual(Ok(null))
      expect(after).toEqual(Ok(item))
    }
  })

  test('should get correctly', async () => {
    const fixtures = await Fixtures()
    for (const fixture of fixtures) {
      const item = randomItem()

      fixture.keyValueDb.set(item.id, item)

      const got = fixture.keyValueDb.get(item.id, Item)

      expect(got).toEqual(Ok(item))
    }
  })

  test('should zap items correctly', async () => {
    const fixtures = await Fixtures()
    for (const fixture of fixtures) {
      const item = randomItem()

      fixture.keyValueDb.set(item.id, item)

      const before = fixture.keyValueDb.get(item.id, Item)

      fixture.keyValueDb.zap(item.id)

      const after = fixture.keyValueDb.get(item.id, Item)

      expect(before).toEqual(Ok(item))
      expect(after).toEqual(Ok(null))
    }
  })

  test.skip('should handle overwriting existing keys', async () => {
    const fixtures = await Fixtures()
    for (const fixture of fixtures) {
      const key = 'test-key'
      const initialItem = randomItem()
      initialItem.id = key
      const updatedItem = randomItem()
      updatedItem.id = key

      // Set initial value
      fixture.keyValueDb.set(key, initialItem)
      const initial = fixture.keyValueDb.get(key, Item)
      expect(initial).toEqual(Ok(initialItem))

      // Overwrite with new value
      fixture.keyValueDb.set(key, updatedItem)
      const updated = fixture.keyValueDb.get(key, Item)
      expect(updated).toEqual(Ok(updatedItem))
      expect(updated).not.toEqual(initial)
    }
  })
})
