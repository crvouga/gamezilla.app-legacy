import { s } from '~/@/schema'
import { Url } from '../url/url'

const schema = s.obj({
  servers: s.arr(
    s.obj({
      tags: s.arr(s.str()),
      url: Url.schema,
    }),
  ),
})

export type ServerRegistryRecord = s.Infer<typeof schema>

export const ServerRegistryRecord = {
  schema,
}
