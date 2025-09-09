import { TranslatedText } from '../l18n'
import { Translator } from '../l18n/generated'
import { s } from '../schema'

/**
 * Schema for TimeSpan type
 */
const schema = s.obj({
  type: s.l('TimeSpan'),
  _durationMilliseconds: s.num(),
})

export type TimeSpan = s.Infer<typeof schema>

/**
 * Creates a TimeSpan from milliseconds
 * @param durationMilliseconds Duration in milliseconds
 * @example
 * ```ts
 * const span = TimeSpan.milliseconds(1500) // 1.5 seconds
 * ```
 */
const milliseconds = (durationMilliseconds: number): TimeSpan => {
  return {
    type: 'TimeSpan',
    _durationMilliseconds: ensureCleanNonNegativeNumber(durationMilliseconds),
  }
}

/**
 * Creates a TimeSpan from seconds
 * @param durationSeconds Duration in seconds
 * @example
 * ```ts
 * const span = TimeSpan.seconds(1.5) // 1.5 seconds
 * ```
 */
const seconds = (durationSeconds: number): TimeSpan => {
  return milliseconds(durationSeconds * 1000)
}

/**
 * Creates a TimeSpan from minutes
 * @param durationMinutes Duration in minutes
 * @example
 * ```ts
 * const span = TimeSpan.minutes(5) // 5 minutes
 * ```
 */
const minutes = (durationMinutes: number): TimeSpan => {
  return seconds(durationMinutes * 60)
}

/**
 * Creates a TimeSpan from hours
 * @param durationHours Duration in hours
 * @example
 * ```ts
 * const span = TimeSpan.hours(2) // 2 hours
 * ```
 */
const hours = (durationHours: number): TimeSpan => {
  return minutes(durationHours * 60)
}

/**
 * Creates a TimeSpan from days
 * @param durationDays Duration in days
 * @example
 * ```ts
 * const span = TimeSpan.days(1) // 1 day
 * ```
 */
const days = (durationDays: number): TimeSpan => {
  return hours(durationDays * 24)
}

/**
 * Creates a TimeSpan from weeks
 * @param durationWeeks Duration in weeks
 * @example
 * ```ts
 * const span = TimeSpan.weeks(2) // 2 weeks
 * ```
 */
const weeks = (durationWeeks: number): TimeSpan => {
  return days(durationWeeks * 7)
}

/**
 * Creates a TimeSpan from years
 * @param durationYears Duration in years (assumes 365 days per year)
 * @example
 * ```ts
 * const span = TimeSpan.years(1) // 1 year
 * ```
 */
const years = (durationYears: number): TimeSpan => {
  return days(durationYears * 365)
}

/**
 * Converts a TimeSpan to milliseconds
 * @example
 * ```ts
 * const span = TimeSpan.seconds(1.5)
 * TimeSpan.toMilliseconds(span) // 1500
 * ```
 */
const toMilliseconds = (timeSpan: TimeSpan): number => {
  return timeSpan._durationMilliseconds
}

/**
 * Converts a TimeSpan to seconds
 * @example
 * ```ts
 * const span = TimeSpan.milliseconds(1500)
 * TimeSpan.toSeconds(span) // 1.5
 * ```
 */
const toSeconds = (timeSpan: TimeSpan): number => {
  return toMilliseconds(timeSpan) / 1000
}

/**
 * Converts a TimeSpan to minutes
 * @example
 * ```ts
 * const span = TimeSpan.seconds(90)
 * TimeSpan.toMinutes(span) // 1.5
 * ```
 */
const toMinutes = (timeSpan: TimeSpan): number => {
  return toSeconds(timeSpan) / 60
}

/**
 * Converts a TimeSpan to hours
 * @example
 * ```ts
 * const span = TimeSpan.minutes(90)
 * TimeSpan.toHours(span) // 1.5
 * ```
 */
const toHours = (timeSpan: TimeSpan): number => {
  return toMinutes(timeSpan) / 60
}

/**
 * Converts a TimeSpan to days
 * @example
 * ```ts
 * const span = TimeSpan.hours(36)
 * TimeSpan.toDays(span) // 1.5
 * ```
 */
const toDays = (timeSpan: TimeSpan): number => {
  return toHours(timeSpan) / 24
}

/**
 * Converts a TimeSpan to weeks
 * @example
 * ```ts
 * const span = TimeSpan.days(14)
 * TimeSpan.toWeeks(span) // 2
 * ```
 */
const toWeeks = (timeSpan: TimeSpan): number => {
  return toDays(timeSpan) / 7
}

/**
 * Adds two TimeSpans together
 * @example
 * ```ts
 * const span1 = TimeSpan.minutes(30)
 * const span2 = TimeSpan.minutes(15)
 * const total = TimeSpan.add(span1, span2) // 45 minutes
 * ```
 */
const add = (left: TimeSpan, right: TimeSpan): TimeSpan => {
  return milliseconds(toMilliseconds(left) + toMilliseconds(right))
}

/**
 * Subtracts one TimeSpan from another
 * @example
 * ```ts
 * const span1 = TimeSpan.minutes(30)
 * const span2 = TimeSpan.minutes(10)
 * const diff = TimeSpan.subtract(span1, span2) // 20 minutes
 * ```
 */
const subtract = (left: TimeSpan, right: TimeSpan): TimeSpan => {
  return milliseconds(toMilliseconds(left) - toMilliseconds(right))
}

/**
 * Multiplies a TimeSpan by a factor
 * @example
 * ```ts
 * const span = TimeSpan.minutes(30)
 * const doubled = TimeSpan.scale(span, 2) // 60 minutes
 * ```
 */
const scale = (timeSpan: TimeSpan, factor: number): TimeSpan => {
  return milliseconds(toMilliseconds(timeSpan) * factor)
}

const encodingKey = 'TimeSpan'
const delimiter = ':'

/**
 * Encodes a TimeSpan to a string
 * @example
 * ```ts
 * const span = TimeSpan.minutes(30)
 * TimeSpan.encode(span) // "TimeSpan:1800000"
 * ```
 */
const encode = (timeSpan: TimeSpan): string => {
  return [encodingKey, delimiter, timeSpan._durationMilliseconds].join('')
}

/**
 * Decodes a string to a TimeSpan
 * @example
 * ```ts
 * const encoded = "TimeSpan:1800000"
 * const span = TimeSpan.decode(encoded) // 30 minutes
 * ```
 */
const decode = (encoded: string): TimeSpan | null => {
  const [key, value] = encoded.split(delimiter)
  if (typeof key !== 'string') {
    return null
  }
  if (typeof value !== 'string') {
    return null
  }
  if (key !== encodingKey) {
    return null
  }
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) {
    return null
  }
  return {
    type: 'TimeSpan',
    _durationMilliseconds: parsed,
  }
}

/**
 * Checks if two TimeSpans are equal
 * @example
 * ```ts
 * const span1 = TimeSpan.minutes(30)
 * const span2 = TimeSpan.seconds(1800)
 * TimeSpan.eq(span1, span2) // true
 * ```
 */
const eq = (left: TimeSpan, right: TimeSpan): boolean => {
  return toMilliseconds(left) === toMilliseconds(right)
}

/**
 * Checks if one TimeSpan is greater than another
 * @example
 * ```ts
 * const span1 = TimeSpan.minutes(30)
 * const span2 = TimeSpan.minutes(20)
 * TimeSpan.gt(span1, span2) // true
 * ```
 */
const gt = (left: TimeSpan, right: TimeSpan): boolean => {
  return toMilliseconds(left) > toMilliseconds(right)
}

/**
 * Checks if one TimeSpan is less than another
 * @example
 * ```ts
 * const span1 = TimeSpan.minutes(20)
 * const span2 = TimeSpan.minutes(30)
 * TimeSpan.lt(span1, span2) // true
 * ```
 */
const lt = (left: TimeSpan, right: TimeSpan): boolean => {
  return toMilliseconds(left) < toMilliseconds(right)
}

/**
 * Checks if one TimeSpan is greater than or equal to another
 * @example
 * ```ts
 * const span1 = TimeSpan.minutes(30)
 * const span2 = TimeSpan.minutes(30)
 * TimeSpan.gte(span1, span2) // true
 * ```
 */
const gte = (left: TimeSpan, right: TimeSpan): boolean => {
  return toMilliseconds(left) >= toMilliseconds(right)
}

/**
 * Checks if one TimeSpan is less than or equal to another
 * @example
 * ```ts
 * const span1 = TimeSpan.minutes(20)
 * const span2 = TimeSpan.minutes(20)
 * TimeSpan.lte(span1, span2) // true
 * ```
 */
const lte = (left: TimeSpan, right: TimeSpan): boolean => {
  return toMilliseconds(left) <= toMilliseconds(right)
}

/**
 * Formats a TimeSpan in milliseconds
 * @example
 * ```ts
 * const span = TimeSpan.milliseconds(500)
 * TimeSpan.formatMilliseconds(span) // "500ms"
 * ```
 */
const formatMilliseconds = (timeSpan: TimeSpan): TranslatedText => {
  return TranslatedText.of(`${toMilliseconds(timeSpan)}ms`)
}

/**
 * Formats a TimeSpan in seconds
 * @example
 * ```ts
 * const span = TimeSpan.seconds(1.5)
 * TimeSpan.formatSeconds(span) // "1.5s"
 * ```
 */
const formatSeconds = (timeSpan: TimeSpan): TranslatedText => {
  return TranslatedText.of(`${toSeconds(timeSpan)}s`)
}

/**
 * Formats a TimeSpan in minutes
 * @example
 * ```ts
 * const span = TimeSpan.minutes(5)
 * TimeSpan.formatMinutes(span) // "5m"
 * ```
 */
const formatMinutes = (timeSpan: TimeSpan): TranslatedText => {
  return TranslatedText.of(`${toMinutes(timeSpan)}m`)
}

/**
 * Formats a TimeSpan in hours
 * @example
 * ```ts
 * const span = TimeSpan.hours(2)
 * TimeSpan.formatHours(span) // "2h"
 * ```
 */
const formatHours = (timeSpan: TimeSpan): TranslatedText => {
  return TranslatedText.of(`${toHours(timeSpan)}h`)
}

/**
 * Formats a TimeSpan in days
 * @example
 * ```ts
 * const span = TimeSpan.days(3)
 * TimeSpan.formatDays(span) // "3d"
 * ```
 */
const formatDays = (timeSpan: TimeSpan): TranslatedText => {
  return TranslatedText.of(`${toDays(timeSpan)}d`)
}

/**
 * Formats a TimeSpan in the most appropriate unit
 * @example
 * ```ts
 * const ms = TimeSpan.milliseconds(500)
 * TimeSpan.format(ms) // "500ms"
 *
 * const min = TimeSpan.minutes(30)
 * TimeSpan.format(min) // "30m"
 * ```
 */
const format = (timeSpan: TimeSpan): TranslatedText => {
  const ms = toMilliseconds(timeSpan)
  if (ms < 1000) {
    return formatMilliseconds(timeSpan)
  }
  const s = toSeconds(timeSpan)
  if (s < 60) {
    return formatSeconds(timeSpan)
  }
  const m = toMinutes(timeSpan)
  if (m < 60) {
    return formatMinutes(timeSpan)
  }
  const h = toHours(timeSpan)
  if (h < 24) {
    return formatHours(timeSpan)
  }
  return formatDays(timeSpan)
}

/**
 * Formats a TimeSpan in a human-friendly way using the provided translator
 * @example
 * ```ts
 * const span = TimeSpan.minutes(5)
 * TimeSpan.humanFriendlyString(span, translator) // "5 minutes"
 *
 * const shortSpan = TimeSpan.seconds(30)
 * TimeSpan.humanFriendlyString(shortSpan, translator) // "a moment ago"
 * ```
 */
const humanFriendlyString = (timeSpan: TimeSpan, t: Translator): TranslatedText => {
  const seconds = toSeconds(timeSpan)
  const days = seconds / 86400 // Convert seconds to days

  if (days >= 365) {
    const years = days / 365
    return years >= 2 ? t('time-span.year-plural', years) : t('time-span.year-singular')
  }

  if (days >= 30) {
    const months = days / 30
    return months >= 2 ? t('time-span.month-plural', months) : t('time-span.month-singular')
  }

  if (days >= 1) {
    return days >= 2 ? t('time-span.day-plural', days) : t('time-span.day-singular')
  }

  const hours = seconds / 3600
  if (hours >= 1) {
    return hours >= 2 ? t('time-span.hour-plural', hours) : t('time-span.hour-singular')
  }

  const minutes = seconds / 60
  if (minutes >= 1) {
    return minutes >= 2 ? t('time-span.minute-plural', minutes) : t('time-span.minute-singular')
  }

  return t('time-span.moment-ago')
}

/**
 * Negates a TimeSpan
 * @example
 * ```ts
 * const span = TimeSpan.minutes(5)
 * const negated = TimeSpan.negate(span) // -5 minutes
 * ```
 */
const negate = (timeSpan: TimeSpan): TimeSpan => {
  return milliseconds(-toMilliseconds(timeSpan))
}

/**
 * @description
 * `TimeSpan` represents a duration of time.
 */
export const TimeSpan = {
  humanFriendlyString,
  negate,
  //
  //
  //
  milliseconds,
  seconds,
  minutes,
  hours,
  days,
  years,
  weeks,
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
  schema,
  //
  //
  //
  format,
  formatMilliseconds,
  formatSeconds,
  formatMinutes,
  formatHours,
  formatDays,
}

/**
 * Ensures a number is clean and non-negative
 * @example
 * ```ts
 * ensureCleanNonNegativeNumber(-5) // 0
 * ensureCleanNonNegativeNumber(NaN) // 0
 * ensureCleanNonNegativeNumber(10) // 10
 * ```
 */
const ensureCleanNonNegativeNumber = (value: number | undefined): number => {
  if (value === undefined) return 0
  if (isNaN(value)) return 0
  if (value < 0) return 0
  if (value === Infinity) return 0
  return value
}
