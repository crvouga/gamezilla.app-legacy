import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const schema = s.brand(s.str(), 'PackId')

export type PackId = s.Infer<typeof schema>

const is = (id: unknown): id is PackId => {
  return typeof id === 'string' && Uuid.is(id)
}

const generate = (): PackId => {
  return Uuid.generate() as unknown as PackId
}

export const PackId = {
  ...schema,
  is,
  generate,
}
