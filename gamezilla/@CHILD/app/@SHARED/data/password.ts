import { Result } from "gamezilla/@SHARED/core"

export type Password = string & { _opaque: "Password" }

const passwordMinLength = 6

const is = (password: unknown): password is Password => {
    return typeof password === "string" && password.length >= passwordMinLength
}

type Problem = { message: string }

const decode = (password: string): Result<Problem, Password> => {
    if (password.length < passwordMinLength) {
        return Result.err({
            message: `Password must be longer than ${passwordMinLength} characters.`,
        })
    }

    if (is(password)) {
        return Result.ok(password)
    }

    return Result.err({ message: "Password is invalid for an unknown reason." })
}

export const Password = {
    is,
    decode,
}
