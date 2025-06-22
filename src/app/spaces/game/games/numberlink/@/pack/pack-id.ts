import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const schema = s.brand(s.str(), 'PackId')

export type PackId = s.Infer<typeof schema>

const generate = () => {
  return `game-numberlink-pack:${Uuid.generate()}` as PackId
}

const is = (id: unknown): id is PackId => {
  return typeof id === 'string' && id.startsWith('game-numberlink-pack:')
}

export const PackId = {
  ...schema,
  is,
  generate,
}
