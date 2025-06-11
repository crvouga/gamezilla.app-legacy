import { s } from '~/@/schema'
import { isOk } from '~/@/result'
import { MsgFrontend } from './types'

const schema = s.obj({
  t: s.l('numberlink.got-solutions-loader-msg'),
  c: s.obj({
    t: s.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotSolutionsLoaderMsg = s.Infer<typeof schema>

export type MsgShared = GotSolutionsLoaderMsg

const is = (input: unknown): input is GotSolutionsLoaderMsg => {
  return isOk(schema.parse(input))
}

const init = (msg: MsgFrontend): GotSolutionsLoaderMsg => {
  return {
    t: 'numberlink.got-solutions-loader-msg',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

export const GotSolutionsLoaderMsg = {
  schema: schema,
  is,
  init,
}
