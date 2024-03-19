import { tags } from "typia"

export type Brand<T, _B extends string> = T & tags.Default<_B>
