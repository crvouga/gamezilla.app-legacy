import { p } from '~/@/core/parser'
import { getWords } from '~/app/@/data/words'

const parser = p.brand(p.str, 'FlowPackName')

export type FlowPackName = p.Infer<typeof parser>

const generate = async ({ count }: { count: number }) => {
  const { adjectives, nouns } = await getWords()
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `Pack ${count} - ${adjective} ${noun}` as FlowPackName
}

const is = (name: unknown): name is FlowPackName => {
  return typeof name === 'string'
}

export const FlowPackName = {
  ...parser,
  generate,
  is
}
