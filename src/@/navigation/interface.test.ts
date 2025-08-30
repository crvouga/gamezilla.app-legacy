import { ShortId } from '../id/short-id'
import { KeyValueDbSync } from '../key-value-db-sync'
import { Logger } from '../logger'
import { isOk } from '../result'
import { describe, expect, test } from '../test-runner'
import { eventually } from '../test/eventually'
import { Navigation } from './impl'

const Fixture = (config: Navigation) => {
  const navigation = Navigation.init(config)

  return {
    navigation,
  }
}

const Fixtures = () => {
  const configs: Navigation[] = [
    {
      t: 'key-value-db-sync',
      keyValueDbSync: KeyValueDbSync.init({ t: 'hash-map', logger: Logger.init({ t: 'noop' }) }),
      key: `navigation-history-${ShortId.generate(10)}`,
      logger: Logger.init({ t: 'noop' }),
      maxHistoryLength: 100,
    },
    {
      t: 'web-standard',
      logger: Logger.init({ t: 'noop' }),
    },
  ]

  return configs.map(Fixture)
}

describe('navigation', () => {
  test('push should add new value', async () => {
    for (const f of Fixtures()) {
      const result = await f.navigation.push('test', 'value1')
      expect(isOk(result)).toEqual(true)
      expect(f.navigation.get('test')).toEqual('value1')
    }
  })

  test('replace should update last value', async () => {
    for (const f of Fixtures()) {
      await f.navigation.push('test', 'value1')
      const result = await f.navigation.replace('test', 'value2')
      expect(isOk(result)).toEqual(true)
      expect(f.navigation.get('test')).toEqual('value2')
    }
  })

  test('back should remove last value', async () => {
    for (const f of Fixtures()) {
      await f.navigation.push('test', 'value1')
      await f.navigation.push('test', 'value2')
      const result = await f.navigation.back()
      expect(isOk(result)).toEqual(true)
      await eventually(() => {
        expect(f.navigation.get('test')).toEqual('value1')
      })
    }
  })

  test('clear should remove all values', async () => {
    for (const f of Fixtures()) {
      await f.navigation.push('test', 'value1')
      await f.navigation.push('test2', 'value2')
      const result = await f.navigation.clear()
      expect(isOk(result)).toEqual(true)
      expect(f.navigation.get('test')).toEqual(null)
      expect(f.navigation.get('test2')).toEqual(null)
    }
  })

  test.skip('sub should notify of changes', async () => {
    for (const f of Fixtures()) {
      const values: (string | null)[] = []
      const KEY = 'test'
      f.navigation.sub(KEY).sub((value) => values.push(value))
      await f.navigation.push(KEY, 'value1')
      await f.navigation.push(KEY, 'value2')
      await f.navigation.back()
      await f.navigation.clear()
      await eventually(() => {
        expect(values).toEqual(['value1', 'value2', 'value1', null])
      })
    }
  })
})
