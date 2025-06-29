import { describe, expect, test } from '~/@/test-runner'
import { deterministicJsonStringify } from './deterministic-stringify'

describe('deterministicJsonStringify', () => {
  test('should handle primitive values', () => {
    expect(deterministicJsonStringify(42)).toEqual('42')
    expect(deterministicJsonStringify('hello')).toEqual('"hello"')
    expect(deterministicJsonStringify(true)).toEqual('true')
    expect(deterministicJsonStringify(null)).toEqual('null')
  })

  test('should handle arrays', () => {
    expect(deterministicJsonStringify([1, 2, 3])).toEqual('[1,2,3]')
    expect(deterministicJsonStringify(['a', 'b', 'c'])).toEqual('["a","b","c"]')
  })

  test('should handle objects with sorted keys', () => {
    const input = { b: 2, a: 1, c: 3 }
    expect(deterministicJsonStringify(input)).toEqual('{"a":1,"b":2,"c":3}')
  })

  test('should handle nested objects with sorted keys', () => {
    const input = {
      b: { y: 2, x: 1 },
      a: { z: 3, w: 0 },
    }
    expect(deterministicJsonStringify(input)).toEqual('{"a":{"w":0,"z":3},"b":{"x":1,"y":2}}')
  })

  test('should handle bigint values', () => {
    expect(deterministicJsonStringify(BigInt(123))).toEqual('"123"')
    expect(deterministicJsonStringify({ value: BigInt(456) })).toEqual('{"value":"456"}')
  })

  test('should handle mixed types', () => {
    const input = {
      b: [2, 1],
      a: { y: 2, x: 1 },
      c: BigInt(123),
    }
    expect(deterministicJsonStringify(input)).toEqual('{"a":{"x":1,"y":2},"b":[2,1],"c":"123"}')
  })

  test('should handle empty objects and arrays', () => {
    expect(deterministicJsonStringify({})).toEqual('{}')
    expect(deterministicJsonStringify([])).toEqual('[]')
  })

  test('should handle objects with undefined and null values', () => {
    const input = { a: undefined, b: null, c: 1 }
    expect(deterministicJsonStringify(input)).toEqual('{"b":null,"c":1}')
  })

  test('should handle deeply nested structures', () => {
    const input = {
      a: {
        b: {
          c: [1, 2, { d: 3 }],
          e: { f: 4 },
        },
      },
    }
    expect(deterministicJsonStringify(input)).toEqual('{"a":{"b":{"c":[1,2,{"d":3}],"e":{"f":4}}}}')
  })

  test('should handle arrays with mixed types', () => {
    const input = [1, 'two', { three: 3 }, [4, 5], BigInt(6)]
    expect(deterministicJsonStringify(input)).toEqual('[1,"two",{"three":3},[4,5],"6"]')
  })

  test.todo('should handle objects with special characters in keys', () => {
    const input = {
      'key with spaces': 1,
      'key-with-dashes': 2,
      'key.with.dots': 3,
      'key:with:colons': 4,
      'key/with/slashes': 5,
      'key\\with\\backslashes': 6,
      'key"with"quotes': 7,
      "key'with'apostrophes": 8,
    }
    expect(deterministicJsonStringify(input)).toEqual(
      '{"key with spaces":1,"key-with-dashes":2,"key.with.dots":3,"key:with:colons":4,"key/with/slashes":5,"key\\\\with\\\\backslashes":6,"key\\"with\\"quotes":7,"key\'with\'apostrophes":8}',
    )
  })

  test.todo('should handle objects with numeric keys', () => {
    const input = {
      '1': 'one',
      '2': 'two',
      '10': 'ten',
      '01': 'zero-one',
    }
    expect(deterministicJsonStringify(input)).toEqual('{"01":"zero-one","1":"one","10":"ten","2":"two"}')
  })

  test.todo('should handle objects with unicode keys', () => {
    const input = {
      '😊': 'emoji',
      你好: 'chinese',
      こんにちは: 'japanese',
      안녕하세요: 'korean',
    }
    expect(deterministicJsonStringify(input)).toEqual(
      '{"😊":"emoji","你好":"chinese","こんにちは":"japanese","안녕하세요":"korean"}',
    )
  })

  test('should produce consistent output for deep equality checks', () => {
    const obj1 = {
      b: 2,
      a: 1,
      c: {
        y: 2,
        x: 1,
        z: [3, 1, 2],
      },
    }
    const obj2 = {
      a: 1,
      b: 2,
      c: {
        x: 1,
        y: 2,
        z: [3, 1, 2],
      },
    }
    // Objects are structurally equal but have different key orders
    expect(deterministicJsonStringify(obj1)).toEqual(deterministicJsonStringify(obj2))
  })

  test('should handle nested arrays with objects for deep equality', () => {
    const arr1 = [{ b: 2, a: 1 }, [3, { y: 2, x: 1 }], { c: 3, d: 4 }]
    const arr2 = [{ a: 1, b: 2 }, [3, { x: 1, y: 2 }], { d: 4, c: 3 }]
    // Arrays contain objects with different key orders
    expect(deterministicJsonStringify(arr1)).toEqual(deterministicJsonStringify(arr2))
  })

  test('should maintain consistent output for complex nested structures', () => {
    const struct1 = {
      data: {
        users: [
          { id: 2, name: 'Bob' },
          { id: 1, name: 'Alice' },
        ],
        metadata: {
          version: 1,
          timestamp: BigInt(1234567890),
        },
      },
    }
    const struct2 = {
      data: {
        metadata: {
          timestamp: BigInt(1234567890),
          version: 1,
        },
        users: [
          { name: 'Alice', id: 1 },
          { name: 'Bob', id: 2 },
        ],
      },
    }
    // Complex nested structure with different ordering at multiple levels
    expect(deterministicJsonStringify(struct1)).not.toEqual(deterministicJsonStringify(struct2))
  })

  test('should return null for non-serializable data', () => {
    const circular: any = { a: 1 }
    circular.self = circular

    const func = () => {}
    const symbol = Symbol('test')
    const undefined_ = undefined

    expect(deterministicJsonStringify(circular)).toEqual('null')
    expect(deterministicJsonStringify(func)).toEqual('null')
    expect(deterministicJsonStringify(symbol)).toEqual('null')
    expect(deterministicJsonStringify(undefined_)).toEqual('null')
  })
})
