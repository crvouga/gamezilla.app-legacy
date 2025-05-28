import { p } from '~/@/parser'
import { isOk } from '~/@/result'
import { MsgFrontend } from './types'

const parser = p.obj({
  t: p.l('got-solutions-loader-msg'),
  c: p.obj({
    t: p.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotSolutionsLoaderMsg = p.Infer<typeof parser>

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
