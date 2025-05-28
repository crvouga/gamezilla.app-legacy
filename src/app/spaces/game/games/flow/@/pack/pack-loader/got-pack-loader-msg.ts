import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { MsgFrontend } from './types'

const parser = s.obj({
  t: s.l('got-pack-loader-cmd'),
  c: s.obj({
    t: s.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotPackLoaderMsg = s.Infer<typeof parser>

const is = (input: unknown): input is GotPackLoaderMsg => {
  return isOk(parser.parse(input))
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
  parser,
  is,
  init,
}
