import { getWords } from '~/app/@/data/words'
import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'

export type PuzzleName = Brand<string, 'PuzzleName'>

const generate = async (input: { count?: number }) => {
  const { adjectives, nouns } = await getWords()
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const name = [input.count ? `Puzzle ${input.count}` : null, `${adjective} ${noun}`].filter(Boolean).join(' - ')
  return name as PuzzleName
}

const is = (x: unknown): x is PuzzleName => typeof x === 'string'

const schema = s.custom(is, 'Invalid flow puzzle name')

export const PuzzleName = {
  ...schema,
  generate,
  is,
}
