import { describe, expect, test } from '~/@/test-runner'
import { ascend, Comparator, isAscend, isDescend } from './sort'

describe('sort', () => {
  test('isAscend', () => {
    expect(isAscend([1, 2, 3, 4, 5], (x) => x)).toEqual(true)
    expect(isAscend([5, 4, 3, 2, 1], (x) => x)).toEqual(false)
  })

  test('isDescend', () => {
    expect(isDescend([1, 2, 3, 4, 5], (x) => x)).toEqual(false)
    expect(isDescend([5, 4, 3, 2, 1], (x) => x)).toEqual(true)
  })

  test('Comparator.combine', () => {
    type Item = { a: number; b: number }

    const items: Item[] = [
      { a: 1, b: 2 },
      { a: 1, b: 1 },
      { a: 2, b: 1 },
    ]

    const comparator = Comparator.combine([ascend<Item>((x) => x.a), ascend<Item>((x) => x.b)])

    const sorted = [...items].sort(comparator)

    expect(sorted).toEqual([
      { a: 1, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 1 },
    ])
  })

  test('Comparator.combine with booleans', () => {
    type Item = { a: boolean; b: boolean }

    const items: Item[] = [
      { a: true, b: false },
      { a: true, b: true },
      { a: false, b: true },
    ]

    const comparator = Comparator.combine([ascend<Item>((x) => x.a), ascend<Item>((x) => x.b)])

    const sorted = [...items].sort(comparator)

    expect(sorted).toEqual([
      { a: false, b: true },
      { a: true, b: false },
      { a: true, b: true },
    ])
  })

  test('Comparator.combine with strings', () => {
    type Item = { a: string; b: string }

    const items: Item[] = [
      { a: 'a', b: 'b' },
      { a: 'a', b: 'a' },
      { a: 'b', b: 'a' },
    ]

    const comparator = Comparator.combine([ascend<Item>((x) => x.a), ascend<Item>((x) => x.b)])

    const sorted = [...items].sort(comparator)

    expect(sorted).toEqual([
      { a: 'a', b: 'a' },
      { a: 'a', b: 'b' },
      { a: 'b', b: 'a' },
    ])
  })
})
