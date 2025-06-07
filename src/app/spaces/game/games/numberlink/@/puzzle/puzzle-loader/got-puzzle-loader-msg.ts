import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { MsgFrontend } from './types'

const schema = s.obj({
  t: s.l('got-puzzle-loader-msg'),
  c: s.obj({
    t: s.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotPuzzleLoaderMsg = s.Infer<typeof schema>

const is = (input: unknown): input is GotPuzzleLoaderMsg => {
  return isOk(schema.parse(input))
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
  schema: schema,
  is,
  init,
}
