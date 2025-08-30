import { describe, expect, test } from '~/@/test-runner'
import { matchSort } from './match-sort'

type Item = { name: string; id: number }

describe('matchSort', () => {
  test('should sort strings by similarity', () => {
    const names = ['johnny', 'jonathan', 'jack', 'jane']
    expect(matchSort(names, (name) => name, 'john')).toEqual(['johnny', 'jack', 'jane', 'jonathan'])
  })

  test('should sort objects by property similarity', () => {
    const users: Item[] = [
      { name: 'alice', id: 1 },
      { name: 'alicia', id: 2 },
      { name: 'bob', id: 3 },
    ]

    expect(matchSort(users, (user: Item) => user.name, 'alice')).toEqual([
      { name: 'alice', id: 1 },
      { name: 'alicia', id: 2 },
      { name: 'bob', id: 3 },
    ])
  })

  test('should filter out items with edit distance > 5', () => {
    const words = ['cat', 'catastrophe', 'catch', 'completely']
    // 'catastrophe' and 'completely' have edit distance > 5 to 'cat', so they should be filtered out
    expect(matchSort(words, (word) => word, 'cat')).toEqual(['cat', 'catch'])
  })

  test('should handle empty array', () => {
    expect(matchSort([], (item) => item, 'test')).toEqual([])
  })

  test('should handle single item array', () => {
    expect(matchSort(['test'], (item) => item, 'test')).toEqual(['test'])
  })

  test('should sort by ascending edit distance', () => {
    const words = ['testing', 'test', 'tester', 'tested']
    // All words have edit distance ≤ 5 to 'test', so they should all be included
    // Sorted by ascending edit distance: test(0), tested(2), tester(2), testing(3)
    // Note: tested and tester both have edit distance 2, so their relative order may vary
    const result = matchSort(words, (word) => word, 'test')

    // Check that we have all 4 items
    expect(result.length).toEqual(4)

    // Check that 'test' is first (exact match, distance 0)
    expect(result[0]).toEqual('test')

    // Check that 'testing' is last (highest distance, 3)
    expect(result[3]).toEqual('testing')

    // Check that both 'tested' and 'tester' are in the middle (both distance 2)
    expect(result.slice(1, 3).includes('tested')).toEqual(true)
    expect(result.slice(1, 3).includes('tester')).toEqual(true)
  })

  test('should handle case sensitivity', () => {
    const words = ['Test', 'test', 'TEST', 'tEsT']
    // All words have edit distance ≤ 5 to 'test', so they should all be included
    // Sorted by ascending edit distance: test(0), Test(1), tEsT(3), TEST(3)
    const sorted = matchSort(words, (word) => word, 'test')
    expect(sorted).toEqual(['test', 'Test', 'tEsT', 'TEST'])
  })
})
