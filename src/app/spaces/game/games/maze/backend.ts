import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { type ModelBackend, type MsgBackend, type MsgToBackend, type Res, handle, initShared, tick } from './types'
import { Time } from '~/@/time/time'

//
//
//
// Model
//
//
//

export type Model = ModelBackend

export const init = initShared

//
//
//
// Update
//
//
//

export type Msg = MsgBackend

export const update = (msg: Msg, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case 'tick': {
      const modelNew = tick(model)
      return [modelNew, Eff.None]
    }
  }
}

export const updateFromClient = (msg: MsgToBackend, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case 'stop-game':
    case 'input-direction':
    case 'input-seed':
    case 'start-game':
    case 'stop-playing':
    case 'start-playing': {
      const res: Res = [...msg, handle(msg, model)]
      const modelNew = res[2].t === 'ok' ? res[2].value : model
      return [modelNew, Eff.None]
    }
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: ModelBackend): Sub<Msg> => {
  if (model.type === 'game') {
    return Time.interval(intervalId, TimeSpan.seconds(1 / 2), () => ['tick'])
    // return Sub.None
  }
  return Sub.None
}
