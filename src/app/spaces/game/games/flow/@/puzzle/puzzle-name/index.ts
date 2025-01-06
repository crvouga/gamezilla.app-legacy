import { getWords } from '~/app/@/data/words'
import type { Brand } from '~/@/brand/brand'
import { p } from '~/@/parser'

export type PuzzleName = Brand<string, 'PuzzleName'>

const generate = async ({ count }: { count: number }) => {
  const { adjectives, nouns } = await getWords()
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const name = `Puzzle ${count} - ${adjective} ${noun}` as PuzzleName
  return name
}

const is = (x: unknown): x is PuzzleName => typeof x === 'string'

const parser = p.custom(is, 'Invalid flow puzzle name')

export const PuzzleName = {
  ...parser,
  generate,
  is,
}
