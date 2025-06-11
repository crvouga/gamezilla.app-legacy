import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { MsgFrontend } from './types'

const schema = s.obj({
  t: s.l('numberlink.got-pack-loader-msg'),
  c: s.obj({
    t: s.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotPackLoaderMsg = s.Infer<typeof schema>

export type MsgShared = GotPackLoaderMsg

const is = (input: unknown): input is GotPackLoaderMsg => {
  return isOk(schema.parse(input))
}

const init = (msg: MsgFrontend): GotPackLoaderMsg => {
  return {
    t: 'numberlink.got-pack-loader-msg',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

export const GotPackLoaderMsg = {
  schema: schema,
  is,
  init,
}
