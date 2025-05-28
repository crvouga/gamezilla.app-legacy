import { s } from '~/@/schema'
import { getWords } from '~/app/@/data/words'

const schema = s.brand(s.str, 'PackName')

export type PackName = s.Infer<typeof schema>

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
  ...schema,
  generate,
  is,
}
