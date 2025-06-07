import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const schema = s.brand(s.str(), 'PackId')

export type PackId = s.Infer<typeof schema>

const generate = () => {
  return `game-numberlink-pack:${Uuid.generate()}` as PackId
}

const is = (flowPackId: unknown): flowPackId is PackId => {
  return typeof flowPackId === 'string'
}

export const PackId = {
  ...schema,
  is,
  generate,
}
