import { adjectives, nouns } from "gamezilla/@CHILD/app/@SHARED/data/words"

export type FlowPackName = string & { __brand: "FlowPackName" }

const generate = ({ count }: { count: number }) => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `Pack ${count} - ${adjective} ${noun}` as FlowPackName
}

export const FlowPackName = {
  generate,
}
