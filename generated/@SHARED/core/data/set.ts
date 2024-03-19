import { Num } from "./num";
import { NonNegInt } from "./num/non-neg-int";
export type Set<T> = {
    _type: "Set";
    _elements: {
        [key: string]: T;
    };
};
export const empty = <T>(): Set<T> => {
    return {
        _type: "Set",
        _elements: {},
    };
};
type ToKey<T> = (element: T) => string;
const singleton = <T>(toKey: ToKey<T>, element: T): Set<T> => {
    const key = toKey ? toKey(element) : String(element);
    return {
        _type: "Set",
        _elements: {
            [key]: element,
        },
    };
};
const from = <T>(toKey: ToKey<T>, array: Iterable<T>): Set<T> => {
    let set = empty<T>();
    for (const element of array) {
        set = add(toKey, element, set);
    }
    return set;
};
const toArray = <T>(set: Set<T>): T[] => {
    return Object.values(set._elements);
};
const add = <T>(toKey: ToKey<T>, element: T, set: Set<T>): Set<T> => {
    const key = toKey(element);
    return {
        ...set,
        [key]: element,
    };
};
const remove = <T>(toKey: ToKey<T>, element: T, set: Set<T>): Set<T> => {
    const key = toKey(element);
    const { [key]: _removed, ...rest } = set._elements;
    return {
        ...set,
        _elements: rest,
    };
};
const union = <T>(a: Set<T>, b: Set<T>): Set<T> => {
    return {
        ...a,
        ...b,
    };
};
const intersect = <T>(a: Set<T>, b: Set<T>): Set<T> => {
    const c = empty<T>();
    for (const key in a) {
        const element = a._elements[key];
        if (!element) {
            continue;
        }
        if (b._elements[key]) {
            c._elements[key] = element;
        }
    }
    return c;
};
const diff = <T>(a: Set<T>, b: Set<T>): Set<T> => {
    const c: Set<T> = { ...a, _elements: { ...a._elements } };
    for (const key in a) {
        const element = a._elements[key];
        if (!element) {
            continue;
        }
        if (b._elements[key]) {
            delete c._elements[key];
        }
    }
    return c;
};
const size = <T>(a: Set<T>): NonNegInt => {
    return NonNegInt.of(Object.keys(a).length);
};
const isEmpty = <T>(a: Set<T>): boolean => {
    return Num.eq(size(a), Num.init(0));
};
const isMember = <T>(toKey: ToKey<T>, element: T, set: Set<T>): boolean => {
    const key = toKey(element);
    return Boolean(set._elements[key]);
};
const eq = <T>(a: Set<T>, b: Set<T>): boolean => {
    return Num.eq(size(intersect(a, b)), size(a));
};
export const Set = {
    singleton,
    from,
    toArray,
    add,
    remove,
    union,
    intersect,
    diff,
    size,
    isEmpty,
    isMember,
    eq,
    empty,
};
