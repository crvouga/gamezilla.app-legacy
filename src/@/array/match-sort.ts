import { editDistance } from '../string/edit-distance'
import { ascend } from './sorting'

/**
 * Sorts and filters items based on string similarity to a target value.
 * Items with edit distance > 5 are filtered out.
 * Remaining items are sorted by ascending edit distance.
 *
 * @example
 * // Sort names by similarity to "john"
 * const names = ['johnny', 'jonathan', 'jack', 'jane']
 * matchSort(names, name => name, 'john')
 * // ['johnny', 'jonathan', 'jane'] // 'jack' filtered out due to distance > 5
 *
 * @example
 * // Sort objects by property similarity
 * const users = [
 *   { name: 'alice', id: 1 },
 *   { name: 'alicia', id: 2 },
 *   { name: 'bob', id: 3 }
 * ]
 * matchSort(users, user => user.name, 'alice')
 * // [{name: 'alice', id: 1}, {name: 'alicia', id: 2}]
 *
 * @param items - Array of items to sort
 * @param toValue - Function to extract string value from each item
 * @param value - Target string value to match against
 * @returns Filtered and sorted array of items
 */
export const matchSort = <T>(items: T[], toValue: (item: T) => string, value: string): T[] => {
  return items
    .flatMap((item) => {
      const distance = editDistance(toValue(item), value)

      if (distance > 5) {
        return []
      }

      return [item]
    })
    .sort(
      ascend((item) => {
        return editDistance(toValue(item), value)
      }),
    )
}
