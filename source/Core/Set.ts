export type Set<T> = {
    [key: string]: T
}

type ToKey<T> = (element: T) => string

export const singleton = <T>(toKey: ToKey<T>, element: T): Set<T> => {
    return {
        [toKey(element)]: element
    }
}

export const fromArray = <T>(toKey: ToKey<T>, array: T[]): Set<T> => {
    const set: Set<T> = {}

    for (const element of array) {
        set[toKey(element)] = element
    }

    return set
}

export const toArray = <T>(set: Set<T>): T[] => {
    return Object.values(set)
}

export const add = <T>(toKey: (element: T) => string, element: T, set: Set<T>): Set<T> => {
    return {
        ...set,
        [toKey(element)]: element
    }
}

export const remove = <T>(toKey: (element: T) => string, element: T, set: Set<T>): Set<T> => {
    const key = toKey(element)
    const { [key]: _removed, ...rest } = set
    return rest
}

export const union = <T>(a: Set<T>, b: Set<T>): Set<T> => {
    return {
        ...a,
        ...b
    }
}

export const intersect = <T>(a: Set<T>, b: Set<T>): Set<T> => {
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

export const diff = <T>(a: Set<T>, b: Set<T>): Set<T> => {
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

export const size = <T>(a: Set<T>): number => {
    return Object.keys(a).length
}

export const isEmpty = <T>(a: Set<T>): boolean => {
    return size(a) === 0
}

export const isMember = <T>(toKey: ToKey<T>, element: T, set: Set<T>): boolean => {
    return Boolean(set[toKey(element)])
}