import { p } from '~/@/parser'
import { getWords } from '~/app/@/data/words'

const parser = p.brand(p.str, 'PackName')

export type PackName = p.Infer<typeof parser>

const generate = async () => {
  const { adjectives, nouns } = await getWords()
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adjective} ${noun}` as PackName
}

const is = (name: unknown): name is PackName => {
  return typeof name === 'string'
}

export const PackName = {
  ...parser,
  generate,
  is,
}
