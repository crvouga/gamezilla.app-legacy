import { s } from '~/@/schema'
import { MsgFrontend } from './types'
import { isOk } from '~/@/result'

const schema = s.obj({
  t: s.l('numberlink.got-hint-calculator-msg'),
  c: s.obj({
    t: s.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotHintCalculatorMsg = s.Infer<typeof schema>

export type MsgShared = GotHintCalculatorMsg

const is = (input: unknown): input is GotHintCalculatorMsg => {
  return isOk(schema.parse(input))
}

const init = (msg: MsgFrontend): GotHintCalculatorMsg => {
  return {
    t: 'numberlink.got-hint-calculator-msg',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

export const GotHintCalculatorMsg = {
  schema: schema,
  is,
  init,
}
