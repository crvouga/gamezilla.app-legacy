import { describe, expect, it } from 'bun:test'
import { p } from './index'
import { Ok } from '../core'

describe(import.meta.file, () => {
  it('should be ok parsing json', async () => {
    const validJson: unknown[] = [
      1,
      'string',
      true,
      null,
      {},
      [],
      {
        key: 'value'
      },
      ['value'],
      {
        key: ['value']
      },
      [
        {
          key: 'value'
        }
      ]
    ]

    for (const json of validJson) {
      expect(p.json.parse(json)).toEqual(Ok(json) as any)
    }
  })
})
