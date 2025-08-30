/**
 * Creates a comparison function for ascending sort order based on one or more key functions
 *
 * @example
 * // Sort numbers ascending
 * [3, 1, 2].sort(ascend(x => x)) // [1, 2, 3]
 *
 * @example
 * // Sort objects by multiple keys ascending
 * const users = [
 *   {name: 'bob', age: 30},
 *   {name: 'alice', age: 30},
 *   {name: 'carol', age: 25}
 * ]
 * users.sort(ascend(
 *   user => user.age,
 *   user => user.name
 * )) // [{name: 'carol', age: 25}, {name: 'alice', age: 30}, {name: 'bob', age: 30}]
 */
export const ascend = <T>(...keyFns: Array<(value: T) => number | string>) => {
  return (a: T, b: T): number => {
    for (const keyFn of keyFns) {
      const aValue = keyFn(a)
      const bValue = keyFn(b)

      if (aValue < bValue) {
        return -1
      }
      if (aValue > bValue) {
        return 1
      }
    }
    return 0
  }
}

/**
 * Creates a comparison function for descending sort order based on one or more key functions
 *
 * @example
 * // Sort numbers descending
 * [3, 1, 2].sort(descend(x => x)) // [3, 2, 1]
 *
 * @example
 * // Sort objects by multiple keys descending
 * const users = [
 *   {name: 'bob', age: 30},
 *   {name: 'alice', age: 30},
 *   {name: 'carol', age: 25}
 * ]
 * users.sort(descend(
 *   user => user.age,
 *   user => user.name
 * )) // [{name: 'bob', age: 30}, {name: 'alice', age: 30}, {name: 'carol', age: 25}]
 */
export const descend = <T>(...keyFns: Array<(value: T) => number | string>) => {
  return (a: T, b: T): number => {
    for (const keyFn of keyFns) {
      const aValue = keyFn(a)
      const bValue = keyFn(b)

      if (aValue > bValue) {
        return -1
      }
      if (aValue < bValue) {
        return 1
      }
    }
    return 0
  }
}
