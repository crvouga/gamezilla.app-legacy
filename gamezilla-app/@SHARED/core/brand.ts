/** @see {isBrand} ts-auto-guard:type-guard */
export type Brand<T, _B extends string> = T & { __branded: _B }
