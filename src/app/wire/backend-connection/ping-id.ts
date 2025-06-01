import { ShortId } from '~/@/id/short-id'
import { s } from '~/@/schema'

const schema = s.brand(s.str(), 'PingId')

export type PingId = s.Infer<typeof schema>

const generate = (): PingId => {
  return ShortId.generate(10) as string as PingId
}

export const PingId = {
  schema,
  generate,
}
