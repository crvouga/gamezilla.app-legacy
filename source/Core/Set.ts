export type Set<T> = {
    [key: string]: T
}

type ToKey<T> = (element: T) => string

const singleton = <T>(toKey: ToKey<T>, element: T): Set<T> => {
    return {
        [toKey(element)]: element
    }
}

const fromArray = <T>(toKey: ToKey<T>, array: T[]): Set<T> => {
    const set: Set<T> = {}

    for (const element of array) {
        set[toKey(element)] = element
    }

    return set
}

const toArray = <T>(set: Set<T>): T[] => {
    return Object.values(set)
}

const add = <T>(toKey: (element: T) => string, element: T, set: Set<T>): Set<T> => {
    return {
        ...set,
        [toKey(element)]: element
    }
}

const remove = <T>(toKey: (element: T) => string, element: T, set: Set<T>): Set<T> => {
    const key = toKey(element)
    const { [key]: _removed, ...rest } = set
    return rest
}

const union = <T>(a: Set<T>, b: Set<T>): Set<T> => {
    return {
        ...a,
        ...b
    }
}

const intersect = <T>(a: Set<T>, b: Set<T>): Set<T> => {
    const c: Set<T> = {}

    for (const key in a) {
        const element = a[key]

        if (!element) {
            continue
        }

        if (b[key]) {
            c[key] = element
        }
    }

    return c
}

const diff = <T>(a: Set<T>, b: Set<T>): Set<T> => {
    const c: Set<T> = { ...a }

    for (const key in a) {
        const element = a[key]

        if (!element) {
            continue
        }

        if (b[key]) {
            delete c[key]
        }
    }

    return c
}

const size = <T>(a: Set<T>): number => {
    return Object.keys(a).length
}

const isEmpty = <T>(a: Set<T>): boolean => {
    return size(a) === 0
}

const isMember = <T>(toKey: ToKey<T>, element: T, set: Set<T>): boolean => {
    return Boolean(set[toKey(element)])
}

export const Set = {
    singleton,
    fromArray,
    toArray,
    add,
    remove,
    union,
    intersect,
    diff,
    size,
    isEmpty,
    isMember,
}