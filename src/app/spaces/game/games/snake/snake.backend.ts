import { Result } from '~/@/result'
import { Time } from '~/@/time/time'
import * as Snake from './@/snake'
import {
  type SpaceModel,
  type InputDirection,
  type InputDirection_Done,
  type InputPlayer,
  type InputPlayer_Done,
  type ModelBackend,
  type MsgBackend,
  type MsgToBackend,
  type Response,
  type ToggleStatus,
  type ToggleStatusResult,
  initSpaceModel,
  startGame,
} from './snake.types'
import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'

//
//
//
// Model
//
//
//

export type Model = ModelBackend

export const init = initSpaceModel

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
      const modelNew: Model = {
        ...Snake.step(model),
        gameStatus: model.gameStatus,
      }

      return [modelNew, Eff.None]
    }
  }
}

export const updateFromFrontend = (msg: MsgToBackend, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case 'start-game': {
      return updateRequest(['StartGame_Done', startGame(model)], model)
    }

    case 'ToggleStatus': {
      return updateRequest(['ToggleStatus_Done', toggleStatus(msg[1], model)], model)
    }

    case 'input-direction': {
      return updateRequest(['InputDirection_Done', inputDirection(msg[1], model)], model)
    }

    case 'InputPlayer': {
      return updateRequest(['InputPlayer_Done', inputPlayer(msg[1], model)], model)
    }
  }
}

const updateRequest = (response: Response, model: Model): [Model, Eff<Msg>] => {
  if (response[1].t === 'err') {
    return [model, Eff.None]
  }

  const modelNew = response[1].value

  return [modelNew, Eff.None]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  switch (model.status) {
    case 'Paused': {
      return Sub.None
    }

    case 'Playing': {
      return Time.interval<Msg>(intervalId, model.tickRate, () => ['tick'])
    }
  }
}

//
//
//
//
//
//
//

export const inputPlayer = (player: InputPlayer[1], model: SpaceModel): InputPlayer_Done[1] => {
  if (model.gameStatus.type !== 'GameSetup') {
    return Result.Err('must_be_in_game_setup')
  }

  const modelNew: SpaceModel = {
    ...model,
    gameStatus: {
      type: 'GameSetup',
      player: player,
    },
  }

  return Result.Ok(modelNew)
}

export const inputDirection = ({ direction, userId }: InputDirection[1], model: SpaceModel): InputDirection_Done[1] => {
  if (model.gameStatus.type !== 'GameStarted') {
    return Result.Err('must_be_in_game_started')
  }

  const playerUserId = model.gameStatus.player[1]

  if (playerUserId !== userId) {
    return Result.Err('user_must_be_the_current_player')
  }

  const modelNew: SpaceModel = {
    ...model,
    ...Snake.enqueueDirection(direction, model),
    status: 'Playing',
  }

  return Result.Ok(modelNew)
}

export const toggleStatus = ({ userId }: ToggleStatus[1], model: SpaceModel): ToggleStatusResult => {
  if (model.gameStatus.type !== 'GameStarted') {
    return Result.Err('must_be_in_game_started')
  }

  if (model.gameStatus.player[1] !== userId) {
    return Result.Err('user_must_be_the_current_player')
  }

  const modelNew: SpaceModel = {
    ...model,
    status: model.status === 'Paused' ? 'Playing' : 'Paused',
  }

  return Result.Ok(modelNew)
}
