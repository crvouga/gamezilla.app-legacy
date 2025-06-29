import { describe, expect, test } from '~/@/test-runner'
import { MinHeap } from './min-heap'

const comparator = (a: number, b: number) => a - b

describe('MinHeap', () => {
  test('initialization', async () => {
    const heap = new MinHeap(comparator)
    expect(heap.isEmpty()).toEqual(true)
  })

  test('insertion', async () => {
    const heap = new MinHeap(comparator)
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.peek()).toEqual(1)
  })

  test('extractMin', async () => {
    const heap = new MinHeap(comparator)
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.extractMin()).toEqual(1)
    expect(heap.peek()).toEqual(2)
    expect(heap.extractMin()).toEqual(2)
    expect(heap.peek()).toEqual(3)
  })

  test('peek', async () => {
    const heap = new MinHeap(comparator)
    heap.insert(2)
    heap.insert(1)
    expect(heap.peek()).toEqual(1)
    heap.extractMin()
    expect(heap.peek()).toEqual(2)
  })

  test('isEmpty', async () => {
    const heap = new MinHeap(comparator)
    expect(heap.isEmpty()).toEqual(true)
    heap.insert(1)
    expect(heap.isEmpty()).toEqual(false)
    heap.extractMin()
    expect(heap.isEmpty()).toEqual(true)
  })
})
