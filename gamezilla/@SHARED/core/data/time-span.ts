export type TimeSpan = {
    type: "TimeSpan"
    _durationMilliseconds: number
}

const fromMilliseconds = (durationMilliseconds: number): TimeSpan => {
    return {
        type: "TimeSpan",
        _durationMilliseconds: durationMilliseconds,
    }
}

const fromSeconds = (durationSeconds: number): TimeSpan => {
    return fromMilliseconds(durationSeconds * 1000)
}

const fromMinutes = (durationMinutes: number): TimeSpan => {
    return fromSeconds(durationMinutes * 60)
}

const fromHours = (durationHours: number): TimeSpan => {
    return fromMinutes(durationHours * 60)
}

const fromDays = (durationDays: number): TimeSpan => {
    return fromHours(durationDays * 24)
}

const fromWeeks = (durationWeeks: number): TimeSpan => {
    return fromDays(durationWeeks * 7)
}

const toMilliseconds = (timeSpan: TimeSpan): number => {
    return timeSpan._durationMilliseconds
}

const toSeconds = (timeSpan: TimeSpan): number => {
    return toMilliseconds(timeSpan) / 1000
}

const toMinutes = (timeSpan: TimeSpan): number => {
    return toSeconds(timeSpan) / 60
}

const toHours = (timeSpan: TimeSpan): number => {
    return toMinutes(timeSpan) / 60
}

const toDays = (timeSpan: TimeSpan): number => {
    return toHours(timeSpan) / 24
}

const toWeeks = (timeSpan: TimeSpan): number => {
    return toDays(timeSpan) / 7
}

const add = (left: TimeSpan, right: TimeSpan): TimeSpan => {
    return fromMilliseconds(toMilliseconds(left) + toMilliseconds(right))
}

const subtract = (left: TimeSpan, right: TimeSpan): TimeSpan => {
    return fromMilliseconds(toMilliseconds(left) - toMilliseconds(right))
}

const scale = (timeSpan: TimeSpan, factor: number): TimeSpan => {
    return fromMilliseconds(toMilliseconds(timeSpan) * factor)
}

const encodingKey = "TimeSpan"
const delimiter = ":"
const encode = (timeSpan: TimeSpan): string => {
    return [encodingKey, delimiter, timeSpan._durationMilliseconds].join("")
}

const decode = (encoded: string): TimeSpan | null => {
    const [key, value] = encoded.split(delimiter)
    if (typeof key !== "string") {
        return null
    }
    if (typeof value !== "string") {
        return null
    }
    if (key !== encodingKey) {
        return null
    }
    const parsed = parseFloat(value)
    if (isNaN(parsed)) {
        return null
    }
    return {
        type: "TimeSpan",
        _durationMilliseconds: parsed,
    }
}

const eq = (left: TimeSpan, right: TimeSpan): boolean => {
    return toMilliseconds(left) === toMilliseconds(right)
}

const gt = (left: TimeSpan, right: TimeSpan): boolean => {
    return toMilliseconds(left) > toMilliseconds(right)
}

const lt = (left: TimeSpan, right: TimeSpan): boolean => {
    return toMilliseconds(left) < toMilliseconds(right)
}

const gte = (left: TimeSpan, right: TimeSpan): boolean => {
    return toMilliseconds(left) >= toMilliseconds(right)
}

const lte = (left: TimeSpan, right: TimeSpan): boolean => {
    return toMilliseconds(left) <= toMilliseconds(right)
}

/**
 *
 *
 *
 *
 */
const humanFriendlyString = (timeSpan: TimeSpan): string => {
    const seconds = toSeconds(timeSpan)
    const days = seconds / 86400 // Convert seconds to days

    if (days >= 365) {
        const years = days / 365
        return years >= 2 ? `${Math.floor(years)} years ago` : "1 year ago"
    }

    if (days >= 30) {
        const months = days / 30
        return months >= 2 ? `${Math.floor(months)} months ago` : "1 month ago"
    }

    if (days >= 1) {
        return days >= 2 ? `${Math.floor(days)} days ago` : "1 day ago"
    }

    const hours = seconds / 3600
    if (hours >= 1) {
        return hours >= 2 ? `${Math.floor(hours)} hours ago` : "1 hour ago"
    }

    const minutes = seconds / 60
    if (minutes >= 1) {
        return minutes >= 2
            ? `${Math.floor(minutes)} minutes ago`
            : "1 minute ago"
    }

    return "A moment ago"
}

/**
 * @description
 * `TimeSpan` represents a duration of time.
 */
export const TimeSpan = {
    humanFriendlyString,
    //
    //
    //
    fromMilliseconds,
    fromSeconds,
    fromMinutes,
    fromHours,
    fromDays,
    fromWeeks,
    //
    //
    //
    toMilliseconds,
    toSeconds,
    toMinutes,
    toHours,
    toDays,
    toWeeks,
    //
    //
    //
    add,
    subtract,
    scale,
    //
    //
    //
    eq,
    gt,
    lt,
    gte,
    lte,
    //
    //
    //
    encode,
    decode,
}
