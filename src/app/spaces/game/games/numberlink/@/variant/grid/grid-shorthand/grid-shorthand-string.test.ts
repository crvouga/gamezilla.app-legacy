import { describe, expect, test } from 'vitest'
import * as VariantGridShorthandString from './grid-shorthand-string'
import * as VariantGridShorthand from './grid-shorthand'

describe('Test', () => {
  test('3x3', () => {
    const stringShorthand = `
            123
            .23
            ..1
        `
    const expected = VariantGridShorthand.init([
      ['A', 'B', 'C'],
      [' ', 'B', 'C'],
      [' ', ' ', 'A'],
    ])
    const actual = VariantGridShorthandString.numberStringToShorthand(stringShorthand)

    expect(actual).toEqual(expected)
  })

  test('5x5', () => {
    const stringShorthand = `
            12..4
            .3.34
            .5.55
            6.7.8
            6.7.8
        `
    const expected = VariantGridShorthand.init([
      ['A', 'B', ' ', ' ', 'D'],
      [' ', 'C', ' ', 'C', 'D'],
      [' ', 'E', ' ', 'E', 'E'],
      ['F', ' ', 'G', ' ', 'H'],
      ['F', ' ', 'G', ' ', 'H'],
    ])
    const actual = VariantGridShorthandString.numberStringToShorthand(stringShorthand)

    expect(actual).toEqual(expected)
  })

  test('10x10', async () => {
    const stringShorthand = `
            1.........
            ..........
            ....2.....
            ..........
            ....3.....
            ..........
            ....4.....
            ..........
            ....5.....
            .........
        `
    const expected = VariantGridShorthand.init([
      ['A', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', 'B', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', 'C', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', 'D', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', 'E', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ])
    const actual = VariantGridShorthandString.numberStringToShorthand(stringShorthand)

    expect(actual).toEqual(expected)
  })
})
