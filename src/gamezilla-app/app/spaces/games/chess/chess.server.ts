import { Sub } from 'gamezilla-app/@/core'
import type { GameServer } from 'gamezilla-app/app/spaces/games/@/architecture/game-server'
import type { ModelServer, ModelCore, MsgServer, MsgCore, MsgToClient, MsgToServer } from './chess.types'

//
//
//
//
//
//
//

type Server = GameServer<{
  MsgCore: MsgCore
  ModelCore: ModelCore
  ModelServer: ModelServer
  MsgServer: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
}>

//
//
//
// Model
//
//
//

export const init: Server['init'] = async (input) => {
  if (input.model) {
    return { model: input.model }
  }
  return {
    model: { t: 'none' }
  }
}

//
//
//
// Update
//
//
//

export const update: Server['update'] = async (_input) => {
  return {
    model: {
      t: 'none'
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

export const subscriptions: Server['subscriptions'] = async (_input) => {
  return Sub.None
}
