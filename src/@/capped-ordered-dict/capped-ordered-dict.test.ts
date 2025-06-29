import { describe, expect, test } from '~/@/test-runner'
import { CappedOrderedDict } from './capped-ordered-dict'

describe('CappedOrderedDict', () => {
  test('adding stuff', async () => {
    const initial = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })

    const added = CappedOrderedDict.add(initial, '1', '1')

    const before = CappedOrderedDict.get(initial, '1')
    const after = CappedOrderedDict.get(added, '1')
    expect(before).toEqual(null)
    expect(after).toEqual('1')
  })

  test('adding stuff then removing stuff', async () => {
    const initial = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })

    const added = CappedOrderedDict.add(initial, '1', '1')

    const removed = CappedOrderedDict.remove(initial, '1')

    expect(CappedOrderedDict.get(initial, '1')).toEqual(null)
    expect(CappedOrderedDict.get(added, '1')).toEqual('1')
    expect(CappedOrderedDict.get(removed, '1')).toEqual(null)
  })

  test('remove oldest on max capacity', async () => {
    const initial = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })
    const dict1 = CappedOrderedDict.add(initial, '1', '1')
    const dict2 = CappedOrderedDict.add(dict1, '2', '2')
    const dict3 = CappedOrderedDict.add(dict2, '3', '3')
    const dict4 = CappedOrderedDict.add(dict3, '4', '4')

    //
    expect(CappedOrderedDict.get(dict3, '1')).toEqual('1')
    expect(CappedOrderedDict.get(dict3, '2')).toEqual('2')
    expect(CappedOrderedDict.get(dict3, '3')).toEqual('3')
    expect(CappedOrderedDict.get(dict3, '4')).toEqual(null)
    //
    expect(CappedOrderedDict.get(dict4, '1')).toEqual(null)
    expect(CappedOrderedDict.get(dict4, '2')).toEqual('2')
    expect(CappedOrderedDict.get(dict4, '3')).toEqual('3')
    expect(CappedOrderedDict.get(dict4, '4')).toEqual('4')
  })

  test('should never mutate the input "model"', async () => {
    const initial = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })

    const added = CappedOrderedDict.add(initial, '1', '1')

    expect(CappedOrderedDict.get(initial, '1')).toEqual(null)
    expect(CappedOrderedDict.get(added, '1')).toEqual('1')
  })

  test('should not remove non-existing key', async () => {
    const initial = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })

    const removed = CappedOrderedDict.remove(initial, '1')

    expect(CappedOrderedDict.get(removed, '1')).toEqual(null)
  })

  test('should not add the same key twice', async () => {
    const initial = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })

    const added = CappedOrderedDict.add(initial, '1', '1')
    const addedTwice = CappedOrderedDict.add(added, '1', '1')

    expect(CappedOrderedDict.get(added, '1')).toEqual('1')
    expect(CappedOrderedDict.get(addedTwice, '1')).toEqual('1')
  })

  test('should not remove the same key twice', async () => {
    const initial = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })

    const added = CappedOrderedDict.add(initial, '1', '1')
    const removed = CappedOrderedDict.remove(added, '1')
    const removedTwice = CappedOrderedDict.remove(removed, '1')

    expect(CappedOrderedDict.get(added, '1')).toEqual('1')
    expect(CappedOrderedDict.get(removed, '1')).toEqual(null)
    expect(CappedOrderedDict.get(removedTwice, '1')).toEqual(null)
  })

  test('merges two dictionaries prioritizing left dictionary values', async () => {
    let left = CappedOrderedDict.init<string, string>({
      maxSize: 5,
    })
    let right = CappedOrderedDict.init<string, string>({
      maxSize: 5,
    })

    left = CappedOrderedDict.add(left, '1', 'One')
    left = CappedOrderedDict.add(left, '2', 'Two')
    right = CappedOrderedDict.add(right, '1', 'Uno')
    right = CappedOrderedDict.add(right, '3', 'Three')

    const merged = CappedOrderedDict.mergeLeft(left, right)

    expect(CappedOrderedDict.get(merged, '1')).toEqual('One')
    expect(CappedOrderedDict.get(merged, '2')).toEqual('Two')
    expect(CappedOrderedDict.get(merged, '3')).toEqual('Three')
  })

  test('preserves order from left dictionary and manages new keys from right', async () => {
    let left = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })
    let right = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })

    left = CappedOrderedDict.add(left, '1', 'Left1')
    left = CappedOrderedDict.add(left, '2', 'Left2')
    right = CappedOrderedDict.add(right, '2', 'Right2')
    right = CappedOrderedDict.add(right, '3', 'Right3')

    const merged = CappedOrderedDict.mergeLeft(left, right)
    const values = CappedOrderedDict.valuesNewestFirst(merged)

    expect(values).toEqual(['Left2', 'Left1', 'Right3'])
  })

  test('handles maximum size limit correctly', async () => {
    let left = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })
    let right = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })

    left = CappedOrderedDict.add(left, '1', 'Left1')
    left = CappedOrderedDict.add(left, '2', 'Left2')
    left = CappedOrderedDict.add(left, '3', 'Left3')
    right = CappedOrderedDict.add(right, '4', 'Right4')
    right = CappedOrderedDict.add(right, '5', 'Right5')

    const merged = CappedOrderedDict.mergeLeft(left, right)
    const values = CappedOrderedDict.valuesNewestFirst(merged)

    expect(values).toEqual(['Left3', 'Left2', 'Left1'])
  })

  test('handles empty dictionaries', async () => {
    const left = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })
    const right = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })

    const merged = CappedOrderedDict.mergeLeft(left, right)

    expect(CappedOrderedDict.valuesNewestFirst(merged)).toEqual([])
  })

  test('manages non-overlapping keys', async () => {
    let left = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })
    let right = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })

    left = CappedOrderedDict.add(left, '1', 'Left1')
    right = CappedOrderedDict.add(right, '2', 'Right2')

    const merged = CappedOrderedDict.mergeLeft(left, right)
    const values = CappedOrderedDict.valuesNewestFirst(merged)

    expect(values).toEqual(['Left1', 'Right2'])
  })

  test('should be immutable when merging dictionaries', async () => {
    let left = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })
    let right = CappedOrderedDict.init<string, string>({
      maxSize: 3,
    })

    left = CappedOrderedDict.add(left, '1', 'Left1')
    right = CappedOrderedDict.add(right, '2', 'Right2')

    const merged = CappedOrderedDict.mergeLeft(left, right)

    expect(CappedOrderedDict.get(left, '1')).toEqual('Left1')
    expect(CappedOrderedDict.get(right, '2')).toEqual('Right2')
    expect(CappedOrderedDict.get(merged, '1')).toEqual('Left1')
    expect(CappedOrderedDict.get(merged, '2')).toEqual('Right2')
  })
})
