export type Set<T> = {
    [key: string]: T
}

export const fromArray = <T>(toKey: (element: T) => string, array: T[]): Set<T> => {
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

export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => {
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

export const difference = <T>(a: Set<T>, b: Set<T>): Set<T> => {
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