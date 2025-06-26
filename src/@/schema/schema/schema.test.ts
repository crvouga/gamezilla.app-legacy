import { describe, expect, it } from 'bun:test'
import { s } from '..'

describe('schema', () => {
  it('should parse object', () => {
    const schema = s.obj({
      name: s.str(),
      age: s.num(),
    })

    expect(schema.parse({ name: 'John', age: 20 }).t).toEqual('ok')
    expect(schema.parse({ name: 'John' }).t).toEqual('err')
    expect(schema.parse(null).t).toEqual('err')
  })

  it('should parse partial object', () => {
    const schema = s.partial(
      s.obj({
        name: s.str(),
        age: s.num(),
      }),
    )

    expect(schema.parse({ name: 'John', age: 20 }).t).toEqual('ok')
    expect(schema.parse({ name: 'John' }).t).toEqual('ok')
    expect(schema.parse({ age: 20 }).t).toEqual('ok')
    expect(schema.parse({}).t).toEqual('ok')
    expect(schema.parse(null).t).toEqual('err')
  })
})
