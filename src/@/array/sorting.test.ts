import { describe, expect, test } from '~/@/test-runner'
import { ascend, descend } from './sorting'

describe('sorting', () => {
  describe('ascend', () => {
    test('should sort numbers in ascending order', () => {
      const numbers = [3, 1, 2]
      expect(numbers.sort(ascend((x) => x))).toEqual([1, 2, 3])
    })

    test('should sort strings in ascending order', () => {
      const strings = ['c', 'a', 'b']
      expect(strings.sort(ascend((x) => x))).toEqual(['a', 'b', 'c'])
    })

    test('should sort objects by single key in ascending order', () => {
      const users = [
        { name: 'bob', age: 30 },
        { name: 'alice', age: 25 },
        { name: 'carol', age: 35 },
      ]
      expect(users.sort(ascend((user) => user.age))).toEqual([
        { name: 'alice', age: 25 },
        { name: 'bob', age: 30 },
        { name: 'carol', age: 35 },
      ])
    })

    test('should sort objects by multiple keys in ascending order', () => {
      const users = [
        { name: 'bob', age: 30 },
        { name: 'alice', age: 30 },
        { name: 'carol', age: 25 },
      ]
      expect(
        users.sort(
          ascend(
            (user) => user.age,
            (user) => user.name,
          ),
        ),
      ).toEqual([
        { name: 'carol', age: 25 },
        { name: 'alice', age: 30 },
        { name: 'bob', age: 30 },
      ])
    })
  })

  describe('descend', () => {
    test('should sort numbers in descending order', () => {
      const numbers = [3, 1, 2]
      expect(numbers.sort(descend((x) => x))).toEqual([3, 2, 1])
    })

    test('should sort strings in descending order', () => {
      const strings = ['c', 'a', 'b']
      expect(strings.sort(descend((x) => x))).toEqual(['c', 'b', 'a'])
    })

    test('should sort objects by single key in descending order', () => {
      const users = [
        { name: 'bob', age: 30 },
        { name: 'alice', age: 25 },
        { name: 'carol', age: 35 },
      ]
      expect(users.sort(descend((user) => user.age))).toEqual([
        { name: 'carol', age: 35 },
        { name: 'bob', age: 30 },
        { name: 'alice', age: 25 },
      ])
    })

    test('should sort objects by multiple keys in descending order', () => {
      const users = [
        { name: 'bob', age: 30 },
        { name: 'alice', age: 30 },
        { name: 'carol', age: 25 },
      ]
      expect(
        users.sort(
          descend(
            (user) => user.age,
            (user) => user.name,
          ),
        ),
      ).toEqual([
        { name: 'bob', age: 30 },
        { name: 'alice', age: 30 },
        { name: 'carol', age: 25 },
      ])
    })
  })
})
