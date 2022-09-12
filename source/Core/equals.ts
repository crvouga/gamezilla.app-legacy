// todo remove this dependency
import fastDeepEquals from "fast-deep-equal"

export const isEqual = <a, b>(a: a, b: b): boolean => {
    return fastDeepEquals(a, b)
}