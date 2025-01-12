import { isErr } from '~/@/result'
import { type Res, type ModelBackend, type MsgBackend, type MsgToBackend, handle } from './party.types'
import { exhaustive } from '~/@/function/exhaustive'
import { Eff } from '~/@/eff'

//
//
//
// Model
//
//
//

export type Model = ModelBackend

export const init: Model = {
  parties: {},
  users: {},
}

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
    case 'none': {
      return [model, Eff.None]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromClient = (msg: MsgToBackend, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case 'PartyCreate':
    case 'PartyDestroy':
    case 'PartyJoin':
    case 'party-get':
    case 'PartyLeave': {
      const res: Res = [...msg, handle(msg, model)]
      if (isErr(res[2])) {
        return [model, Eff.None]
      }
      return [res[2].value, Eff.None]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}
