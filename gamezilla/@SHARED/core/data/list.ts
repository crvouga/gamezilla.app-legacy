import { NonNegInt, Num } from "./num"

export type List<T> = {
    _type: "List"
    _elements: T[]
    [Symbol.iterator]: () => Iterator<T>
}

const empty = <T>(): List<T> => {
    return {
        _type: "List",
        _elements: [],
        [Symbol.iterator]: function* () {
            for (const element of this._elements) {
                yield element
            }
        },
    }
}

const of = <T>(element: T): List<T> => {
    return {
        _type: "List",
        _elements: [element],
        [Symbol.iterator]: function* () {
            for (const element of this._elements) {
                yield element
            }
        },
    }
}

const fromArray = <T>(array: T[]): List<T> => {
    return {
        _type: "List",
        _elements: array,
        [Symbol.iterator]: function* () {
            for (const element of this._elements) {
                yield element
            }
        },
    }
}

const toArray = <T>(list: List<T>): T[] => {
    return list._elements
}

const count = <T>(list: List<T>): NonNegInt => {
    return NonNegInt.of(list._elements.length)
}

const map = <T, U>(
    list: List<T>,
    fn: (element: T, index: number) => U,
): List<U> => {
    return fromArray(list._elements.map(fn))
}

const filter = <T>(fn: (element: T) => boolean, list: List<T>): List<T> => {
    return fromArray(list._elements.filter(fn))
}

const slice = <T>(start: NonNegInt, end: NonNegInt, list: List<T>): List<T> => {
    return fromArray(list._elements.slice(Num.unwrap(start), Num.unwrap(end)))
}

const concat = <T>(a: List<T>, b: List<T>): List<T> => {
    return fromArray([...a._elements, ...b._elements])
}

const head = <T>(list: List<T>): T | null => {
    return list._elements[0] ?? null
}

const drop = <T>(n: NonNegInt, list: List<T>): List<T> => {
    return slice(n, count(list), list)
}

const take = <T>(n: NonNegInt, list: List<T>): List<T> => {
    return slice(NonNegInt.of(0), n, list)
}

const tail = <T>(list: List<T>): List<T> => {
    return drop(NonNegInt.of(1), list)
}

const some = <T>(list: List<T>, fn: (element: T) => boolean): boolean => {
    return list._elements.some(fn)
}

const every = <T>(list: List<T>, fn: (element: T) => boolean): boolean => {
    return list._elements.some(fn)
}

const product = <A, B, C>(
    a: List<A>,
    b: List<B>,
    f: (a: A, b: B) => C,
): List<C> => {
    return fromArray(
        a._elements.flatMap((a) => {
            return b._elements.map((b) => f(a, b))
        }),
    )
}

const range = (start: NonNegInt, end: NonNegInt): List<NonNegInt> => {
    return fromArray(
        [...Array(Num.unwrap(end) - Num.unwrap(start))].map((_, i) =>
            NonNegInt.of(i + Num.unwrap(start)),
        ),
    )
}

export const List = {
    empty,
    of,
    fromArray,
    toArray,
    map,
    filter,
    slice,
    concat,
    head,
    tail,
    take,
    drop,
    count,
    some,
    every,
    product,
    range,
}
