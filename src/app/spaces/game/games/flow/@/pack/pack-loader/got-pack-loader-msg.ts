import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { MsgFrontend } from './types'

const schema = s.obj({
  t: s.l('got-pack-loader-cmd'),
  c: s.obj({
    t: s.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotPackLoaderMsg = s.Infer<typeof schema>

const is = (input: unknown): input is GotPackLoaderMsg => {
  return isOk(schema.parse(input))
}

const init = (msg: MsgFrontend): GotPackLoaderMsg => {
  return {
    t: 'got-pack-loader-cmd',
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
