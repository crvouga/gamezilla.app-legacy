import { Sub } from '~/@/sub'
import type { GameBackend } from '~/app/spaces/game/games/@/architecture/game-backend'
import type { ModelBackend, ModelSpace, MsgBackend, MsgSpace, MsgToFrontend, MsgToBackend } from './chess.types'

//
//
//
//
//
//
//

type Backend = GameBackend<{
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
  ModelBackend: ModelBackend
  MsgBackend: MsgBackend
  MsgToFrontend: MsgToFrontend
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
  return Sub.none()
}
