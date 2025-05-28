import { p } from '~/@/parser'
import { isOk } from '~/@/result'
import { MsgFrontend } from './types'

const parser = p.obj({
  t: p.l('got-pack-loader-cmd'),
  c: p.obj({
    t: p.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotPackLoaderMsg = p.Infer<typeof parser>

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
