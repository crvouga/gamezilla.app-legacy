import { Task } from "gamezilla-app/@SHARED/core";
export type DbConnKv = {
    get: <TValue>(key: string, isValue: (row: unknown) => row is TValue) => Task<string, TValue | null>;
    set: <TValue>(key: string, value: TValue) => Task<string, null>;
    zap: (key: string) => Task<string, null>;
};
const instance = <TKey extends string = string, TValue = unknown>(dbConnKv: DbConnKv, namespace: string[], isValue: (row: unknown) => row is TValue): {
    get: (key: TKey) => Task<string, TValue | null>;
    set: (key: TKey, value: TValue) => Task<string, null>;
    zap: (key: TKey) => Task<string, null>;
} => {
    const toKey = (key: string) => [...namespace, key].join(":");
    return {
        get: (key) => {
            return dbConnKv.get(toKey(key), isValue);
        },
        set: (key, value: TValue) => {
            return dbConnKv.set(toKey(key), value);
        },
        zap: (key) => {
            return dbConnKv.zap(toKey(key));
        },
    };
};
export const DbConnKv = {
    instance,
};
