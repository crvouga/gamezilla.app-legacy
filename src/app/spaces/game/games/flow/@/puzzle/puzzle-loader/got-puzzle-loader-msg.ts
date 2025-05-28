import { p } from '~/@/parser'
import { isOk } from '~/@/result'
import { MsgFrontend } from './types'

const parser = p.obj({
  t: p.l('got-puzzle-loader-msg'),
  c: p.obj({
    t: p.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotPuzzleLoaderMsg = p.Infer<typeof parser>

const is = (input: unknown): input is GotPuzzleLoaderMsg => {
  return isOk(parser.parse(input))
}

const init = (msg: MsgFrontend): GotPuzzleLoaderMsg => {
  return {
    t: 'got-puzzle-loader-msg',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

export const GotPuzzleLoaderMsg = {
  parser,
  is,
  init,
}
