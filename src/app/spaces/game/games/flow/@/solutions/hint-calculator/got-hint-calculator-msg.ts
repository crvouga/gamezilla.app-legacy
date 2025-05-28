import { s } from '~/@/schema'
import { MsgFrontend } from './types'

const schema = s.obj({
  t: s.l('got-hint-calculator-msg'),
  c: s.obj({
    t: s.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotHintCalculatorMsg = s.Infer<typeof schema>

const is = (input: unknown): input is GotHintCalculatorMsg => {
  return typeof input === 'object' && input !== null && 't' in input && input.t === 'got-hint-calculator-msg'
}

const init = (msg: MsgFrontend): GotHintCalculatorMsg => {
  return {
    t: 'got-hint-calculator-msg',
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
