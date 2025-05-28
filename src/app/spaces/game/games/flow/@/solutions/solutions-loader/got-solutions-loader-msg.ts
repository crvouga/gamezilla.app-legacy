import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { MsgFrontend } from './types'

const parser = s.obj({
  t: s.l('got-solutions-loader-msg'),
  c: s.obj({
    t: s.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotSolutionsLoaderMsg = s.Infer<typeof parser>

const is = (input: unknown): input is GotSolutionsLoaderMsg => {
  return isOk(parser.parse(input))
}

const init = (msg: MsgFrontend): GotSolutionsLoaderMsg => {
  return {
    t: 'got-solutions-loader-msg',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

export const GotSolutionsLoaderMsg = {
  parser,
  is,
  init,
}
