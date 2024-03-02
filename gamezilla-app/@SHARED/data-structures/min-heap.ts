export class MinHeap<T> {
  private heap: T[]
  private compare: (a: T, b: T) => number

  constructor(compare: (a: T, b: T) => number) {
    this.heap = []
    this.compare = compare
  }

  private getLeftChildIndex(parentIndex: number): number {
    return 2 * parentIndex + 1
  }

  private getRightChildIndex(parentIndex: number): number {
    return 2 * parentIndex + 2
  }

  private getParentIndex(childIndex: number): number {
    return Math.floor((childIndex - 1) / 2)
  }

  private swap(indexOne: number, indexTwo: number): void {
    // @ts-ignore
    ;[this.heap[indexOne], this.heap[indexTwo]] = [
      this.heap[indexTwo],
      this.heap[indexOne],
    ]
  }

  private heapifyUp(): void {
    let index = this.heap.length - 1
    while (index > 0) {
      const parentIndex = this.getParentIndex(index)
      if (this.compare(this.heap[parentIndex]!, this.heap[index]!) > 0) {
        this.swap(parentIndex, index)
        index = parentIndex
      } else {
        break
      }
    }
  }

  private heapifyDown(): void {
    let index = 0
    let smallest = index

    while (this.getLeftChildIndex(index) < this.heap.length) {
      const leftChildIndex = this.getLeftChildIndex(index)
      const rightChildIndex = this.getRightChildIndex(index)

      if (
        leftChildIndex < this.heap.length &&
        this.compare(this.heap[leftChildIndex]!, this.heap[smallest]!) < 0
      ) {
        smallest = leftChildIndex
      }
      if (
        rightChildIndex < this.heap.length &&
        this.compare(this.heap[rightChildIndex]!, this.heap[smallest]!) < 0
      ) {
        smallest = rightChildIndex
      }

      if (smallest !== index) {
        this.swap(index, smallest)
        index = smallest
      } else {
        break
      }
    }
  }

  public insert(value: T): void {
    this.heap.push(value)
    this.heapifyUp()
  }

  public extractMin(): T | undefined {
    if (this.heap.length === 0) {
      return undefined
    }

    if (this.heap.length === 1) {
      return this.heap.pop()
    }

    const min = this.heap[0]

    this.heap[0] = this.heap.pop()!

    this.heapifyDown()

    return min
  }

  public peek(): T | undefined {
    return this.heap.length > 0 ? this.heap[0] : undefined
  }

  public isEmpty(): boolean {
    return this.heap.length === 0
  }

  public has(value: T): boolean {
    return this.heap.some((element) => this.compare(element, value) === 0)
  }

  public clear(): void {
    this.heap = []
  }
}
