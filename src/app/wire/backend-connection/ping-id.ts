import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const schema = s.brand(s.str(), 'PingId')

export type PingId = s.Infer<typeof schema>

const generate = (): PingId => {
  return Uuid.generate() as string as PingId
}

export const PingId = {
  schema,
  generate,
}
