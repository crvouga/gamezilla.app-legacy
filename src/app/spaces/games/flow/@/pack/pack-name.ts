import { p } from '~/@/parser'
import { getWords } from '~/app/@/data/words'

const parser = p.brand(p.str, 'PackName')

export type PackName = p.Infer<typeof parser>

const generate = async ({ count }: { count: number }) => {
  const { adjectives, nouns } = await getWords()
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `Pack ${count} - ${adjective} ${noun}` as PackName
}

const is = (name: unknown): name is PackName => {
  return typeof name === 'string'
}

export const PackName = {
  ...parser,
  generate,
  is
}
