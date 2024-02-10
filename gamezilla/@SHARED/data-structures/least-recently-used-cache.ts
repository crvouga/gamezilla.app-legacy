export class LRUCache<K, V> implements Map<K, V> {
    private capacity: number
    private map: Map<K, V>
    private keysInUse: Array<K>

    constructor({ capacity }: { capacity: number }) {
        this.capacity = capacity
        this.map = new Map<K, V>()
        this.keysInUse = []
    }

    get(key: K): V | undefined {
        if (!this.map.has(key)) {
            return undefined
        }

        this.refreshKey(key)
        return this.map.get(key)
    }

    set(key: K, value: V): this {
        if (this.map.has(key)) {
            this.refreshKey(key)
        } else {
            if (this.map.size >= this.capacity) {
                this.evictLeastRecentlyUsed()
            }
            this.keysInUse.push(key)
        }

        this.map.set(key, value)
        return this
    }

    delete(key: K): boolean {
        if (!this.map.has(key)) {
            return false
        }

        this.map.delete(key)
        const index = this.keysInUse.indexOf(key)
        if (index > -1) {
            this.keysInUse.splice(index, 1)
        }
        return true
    }

    clear(): void {
        this.map.clear()
        this.keysInUse = []
    }

    private refreshKey(key: K): void {
        const index = this.keysInUse.indexOf(key)
        if (index > -1) {
            this.keysInUse.splice(index, 1)
        }
        this.keysInUse.push(key)
    }

    private evictLeastRecentlyUsed(): void {
        const keyToEvict = this.keysInUse.shift()
        if (keyToEvict !== undefined) {
            this.map.delete(keyToEvict)
        }
    }

    entries(): IterableIterator<[K, V]> {
        return this.map.entries()
    }

    forEach(
        callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        thisArg?: any,
    ): void {
        this.map.forEach(callbackfn, thisArg)
    }

    has(key: K): boolean {
        return this.map.has(key)
    }

    keys(): IterableIterator<K> {
        return this.map.keys()
    }

    get size() {
        return this.map.size
    }

    values(): IterableIterator<V> {
        return this.map.values()
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.map[Symbol.iterator]()
    }

    get [Symbol.toStringTag]() {
        return this.map[Symbol.toStringTag]
    }
}
