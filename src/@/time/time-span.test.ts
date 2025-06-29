import { describe, expect, test } from '~/@/test-runner'
import { Translator } from '~/app/@/frontend/translator'
import { TimeSpan } from './time-span'

const t = Translator('en')

describe('TimeSpan', () => {
  test("should return 'X year(s) ago' for year intervals", () => {
    expect(TimeSpan.humanFriendlyString(TimeSpan.days(365), t)).toEqual(t('time-span.year-singular'))
    expect(TimeSpan.humanFriendlyString(TimeSpan.days(365 * 2), t)).toEqual(t('time-span.year-plural', 2))
  })

  test("should return 'X month(s) ago' for month intervals", () => {
    expect(TimeSpan.humanFriendlyString(TimeSpan.days(32), t)).toEqual(t('time-span.month-singular'))
    expect(TimeSpan.humanFriendlyString(TimeSpan.days(64), t)).toEqual(t('time-span.month-plural', 2))
  })

  test("should return 'X day(s) ago' for day intervals", () => {
    expect(TimeSpan.humanFriendlyString(TimeSpan.days(1), t)).toEqual(t('time-span.day-singular'))
    expect(TimeSpan.humanFriendlyString(TimeSpan.days(2), t)).toEqual(t('time-span.day-plural', 2))
  })

  test("should return 'X hour(s) ago' for hour intervals", () => {
    expect(TimeSpan.humanFriendlyString(TimeSpan.hours(1), t)).toEqual(t('time-span.hour-singular'))
    expect(TimeSpan.humanFriendlyString(TimeSpan.hours(2), t)).toEqual(t('time-span.hour-plural', 2))
  })

  test("should return 'X minute(s) ago' for minute intervals", () => {
    expect(TimeSpan.humanFriendlyString(TimeSpan.minutes(1), t)).toEqual(t('time-span.minute-singular'))
    expect(TimeSpan.humanFriendlyString(TimeSpan.minutes(2), t)).toEqual(t('time-span.minute-plural', 2))
  })

  test("should return 'A moment ago' for intervals less than a minute", () => {
    expect(TimeSpan.humanFriendlyString(TimeSpan.seconds(30), t)).toEqual(t('time-span.moment-ago'))
  })
})
