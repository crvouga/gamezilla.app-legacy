import { isOk } from '~/@/result'
import { s } from '~/@/schema'
import { MsgFrontend } from './types'

const schema = s.obj({
  t: s.l('got-space-loader-msg'),
  c: s.obj({
    t: s.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotPuzzleLoaderMsg = s.Infer<typeof schema>

export type MsgShared = s.Infer<typeof schema>

const is = (input: unknown): input is GotPuzzleLoaderMsg => {
  return isOk(schema.parse(input))
}

const init = (msg: MsgFrontend): GotPuzzleLoaderMsg => {
  return {
    t: 'got-space-loader-msg',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

export const GotPuzzleLoaderMsg = {
  schema,
  is,
  init,
}
