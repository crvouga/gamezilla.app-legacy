import * as Bridge from "../../../Bridge"
import { Cmd, Sub, Time } from "../../../Core"
import { ClientId, RoomId } from "../../../Data"
import { BackendModel, BackendMsg, changeDirection, initSharedModel, ToBackend, ToFrontend, toggleStatus } from "./Snake.Types"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: Model = initSharedModel

// 
// 
// 
// Bridge
// 
// 
// 

export const sendToFrontend = ({clientId, roomId}:{clientId: ClientId.ClientId, roomId: RoomId.RoomId}, msg: ToFrontend) => {
  return Bridge.sendToFrontend([clientId], ['GameRoom', ['Game', [ roomId, ['Snake', msg] ]]])
}

export const broadcast = ({ roomId}:{ roomId: RoomId.RoomId}, msg: ToFrontend) => {
  return Bridge.broadcast(['GameRoom', ['Game', [ roomId, ['Snake', msg] ]]])
}

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch(msg[0]) {
    case 'Tick': {      
      return [model, Cmd.None]    
    }
  }
}

export const updateFromFrontend = (
  {clientId, roomId}:{clientId: ClientId.ClientId, roomId: RoomId.RoomId},
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch(msg[0]) {
    case 'ToggleStatus': {
      const result = toggleStatus(msg[1], model)

      const toFrontend = sendToFrontend({clientId, roomId}, ['ToggleStatusResulted', result])

      if(result.type === 'Err') {
        return [model, toFrontend]  
      }

      const modelNew = result.value

      return [modelNew, Cmd.batch([toFrontend, broadcast({roomId}, ['Sync', modelNew])])]
    }

    case 'ChangeDirection': {
      const result = changeDirection(msg[1], model)

      const toFrontend = sendToFrontend({clientId, roomId}, ['ToggleStatusResulted', result])

      if(result.type === 'Err') {
        return [model, toFrontend]  
      }

      const modelNew = result.value

      return [modelNew, Cmd.batch([toFrontend, broadcast({roomId}, ['Sync', modelNew])])]
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

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  switch(model.status) {
    case 'Paused': {
      return Sub.None
    }

    case 'Playing': {
      return Time.every<Msg>(model.tickRate, () => ['Tick'])
    }
  }
}
