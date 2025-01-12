import { Sub } from '~/@/sub'
import type { GameBackend } from '~/app/spaces/game/games/@/architecture/game-server'
import type { ModelBackend, ModelCore, MsgBackend, MsgCore, MsgToClient, MsgToBackend } from './chess.types'

//
//
//
//
//
//
//

type Backend = GameBackend<{
  MsgCore: MsgCore
  ModelCore: ModelCore
  ModelBackend: ModelBackend
  MsgBackend: MsgBackend
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
}>

//
//
//
// Model
//
//
//

export const init: Backend['init'] = async (input) => {
  if (input.model) {
    return { model: input.model }
  }
  return {
    model: { t: 'none' },
  }
}

//
//
//
// Update
//
//
//

export const update: Backend['update'] = async (_input) => {
  return {
    model: {
      t: 'none',
    },
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Backend['subscriptions'] = async (_input) => {
  return Sub.None
}
