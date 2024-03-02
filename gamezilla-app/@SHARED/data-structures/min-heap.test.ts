import { describe, expect, test } from "bun:test"
import { MinHeap } from "./min-heap"

const comparator = (a: number, b: number) => a - b

describe(import.meta.file, () => {
  test("initialization", () => {
    const heap = new MinHeap(comparator)
    expect(heap.isEmpty()).toBe(true)
  })

  test("insertion", () => {
    const heap = new MinHeap(comparator)
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.peek()).toBe(1)
  })

  test("extractMin", () => {
    const heap = new MinHeap(comparator)
    heap.insert(3)
    heap.insert(1)
    heap.insert(2)
    expect(heap.extractMin()).toBe(1)
    expect(heap.peek()).toBe(2)
    expect(heap.extractMin()).toBe(2)
    expect(heap.peek()).toBe(3)
  })

  test("peek", () => {
    const heap = new MinHeap(comparator)
    heap.insert(2)
    heap.insert(1)
    expect(heap.peek()).toBe(1)
    heap.extractMin()
    expect(heap.peek()).toBe(2)
  })

  test("isEmpty", () => {
    const heap = new MinHeap(comparator)
    expect(heap.isEmpty()).toBe(true)
    heap.insert(1)
    expect(heap.isEmpty()).toBe(false)
    heap.extractMin()
    expect(heap.isEmpty()).toBe(true)
  })
})
