import { adjectives, nouns } from "gamezilla/@CHILD/app/@SHARED/data/words"

export type FlowPuzzleName = string & { _type: "FlowPuzzleName" }

const generate = ({ count }: { count: number }) => {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const name = `Puzzle ${count} - ${adjective} ${noun}` as FlowPuzzleName
    return name
}

const is = (x: unknown): x is FlowPuzzleName => typeof x === "string"

export const FlowPuzzleName = {
    generate,
    is,
}
