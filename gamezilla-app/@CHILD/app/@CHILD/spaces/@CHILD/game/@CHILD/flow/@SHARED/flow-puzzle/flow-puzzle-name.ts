import { getWords } from "gamezilla-app/@CHILD/app/@SHARED/data/words"
import { Brand } from "gamezilla-app/@SHARED/core/brand"
import { p } from "gamezilla-app/@SHARED/core/parser"

export type FlowPuzzleName = Brand<string, "FlowPuzzleName">

const generate = async ({ count }: { count: number }) => {
  const { adjectives, nouns } = await getWords()
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const name = `Puzzle ${count} - ${adjective} ${noun}` as FlowPuzzleName
  return name
}

const is = (x: unknown): x is FlowPuzzleName => typeof x === "string"

const parser = p.custom(is, "Invalid flow puzzle name")

export const FlowPuzzleName = {
  ...parser,
  generate,
  is,
}
