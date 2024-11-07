export type Brand<T, TBrand extends string | number | boolean | null | undefined> = T & { __branded: TBrand }
