import { p } from '~/@/schema'
import { MsgFrontend } from './types'

const parser = p.obj({
  t: p.l('got-hint-calculator-msg'),
  c: p.obj({
    t: p.l('got-msg'),
    msg: MsgFrontend,
  }),
})

export type GotHintCalculatorMsg = p.Infer<typeof parser>

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
  parser,
  is,
  init,
}
