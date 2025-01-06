import * as FlowGridShorthand from './grid-shorthand'

const LETTER_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' as const

export const numberStringToShorthand = (input: string): FlowGridShorthand.Model => {
  const lines = input
    .trim()
    .split('\n')
    .map((line) => line.trim())
  const rows = lines.length
  const cols = lines[0]?.length ?? 0

  const shorthand: FlowGridShorthand.Element[][] = Array.from({ length: rows }, () => Array(cols).fill(' '))

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = lines[i]?.[j]

      if (!cell || cell === ' ' || cell === '.') {
        // @ts-ignore
        shorthand[i][j] = ' '
        continue
      }

      const cellNumber = parseInt(cell, 10)

      if (isNaN(cellNumber) || cellNumber < 1 || cellNumber > LETTER_MAP.length) {
        // @ts-ignore
        shorthand[i][j] = ' '
        continue
      }

      const letter = LETTER_MAP[cellNumber - 1]
      // @ts-ignore
      shorthand[i][j] = letter
    }
  }

  if (FlowGridShorthand.isModel(shorthand)) {
    return shorthand
  }
  return [[' ']]
}
