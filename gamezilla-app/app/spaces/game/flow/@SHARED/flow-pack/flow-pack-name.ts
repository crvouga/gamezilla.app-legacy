import { Brand } from "gamezilla-app/@shared/core/brand"
import { getWords } from "gamezilla-app/app/@shared/data/words"

export type FlowPackName = Brand<string, "FlowPackName">

const generate = async ({ count }: { count: number }) => {
  const { adjectives, nouns } = await getWords()
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `Pack ${count} - ${adjective} ${noun}` as FlowPackName
}

const is = (name: unknown): name is FlowPackName => {
  return typeof name === "string"
}

export const FlowPackName = {
  generate,
  is,
}
