import { describe, expect, it } from 'bun:test'
import { s } from './index'
import { Ok } from '../result'

describe('Test', () => {
  it('should be ok parsing json', async () => {
    const validJson: unknown[] = [
      1,
      'string',
      true,
      null,
      {},
      [],
      {
        key: 'value',
      },
      ['value'],
      {
        key: ['value'],
      },
      [
        {
          key: 'value',
        },
      ],
    ]

    for (const json of validJson) {
      expect(s.json.parse(json)).toEqual(Ok(json) as any)
    }
  })
})
