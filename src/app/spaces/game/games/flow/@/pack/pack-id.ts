import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const parser = s.brand(s.str, 'PackId')

export type PackId = s.Infer<typeof parser>

const generate = () => {
  return `game-flow-pack:${Uuid.generate()}` as PackId
}

const is = (flowPackId: unknown): flowPackId is PackId => {
  return typeof flowPackId === 'string'
}

export const PackId = {
  ...parser,
  is,
  generate,
}
