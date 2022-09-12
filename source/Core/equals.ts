// todo remove this dependency
import fastDeepEquals from "fast-deep-equal"

export const isEqual = <A, B>(a: A, b: B): boolean => {
    return fastDeepEquals(a, b)
}