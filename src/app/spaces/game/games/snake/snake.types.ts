import { KeyboardKey } from '~/@/keyboard'
import { Option } from '~/@/option/option'
import { Result } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'
import type * as Direction from './@/direction'
import * as Snake from './@/snake'

//
//
//
// Model
//
//
//

export type ModelBackend = SpaceModel

export type ModelFrontend = SpaceModel & {
  openedMenuId: Option<string>
}

export type SpaceModel = Snake.Model & {
  gameStatus:
    | {
        type: 'GameSetup'
        player: Option<Player>
      }
    | {
        type: 'GameStarted'
        player: Player
      }
}

export type Player = ['User', UserId]

export type MouseStatus = 'Active' | 'Inactive'

//
//
// Init
//
//

export const initSpaceModel: SpaceModel = {
  ...Snake.init,
  gameStatus: {
    type: 'GameSetup',
    player: Option.None,
  },
}

//
//
//
// Msg
//
//
//

export type MsgFrontend = ['PressedKeyDown', KeyboardKey] | ['OpenedMenu', string] | ['ClosedMenu'] | Request

export type MsgBackend = ['tick']

export type MsgToBackend = Request

export type MsgToFrontend = ['tick', SpaceModel] | Response

export type Request = ToggleStatus | InputPlayer | InputDirection | StartGame

export type Response = InputDirection_Done | ToggleStatus_Done | InputPlayer_Done | StartGame_Done

//
//
//

export type InputDirection = ['input-direction', { direction: Direction.Direction; userId: UserId }]

export type InputDirection_Done = ['InputDirection_Done', Result<InputDirectionProblem, SpaceModel>]

export type InputDirectionProblem = 'user_must_be_the_current_player' | 'must_be_in_game_started'

//
//
//

export type ToggleStatus = ['ToggleStatus', { userId: UserId }]

export type ToggleStatus_Done = ['ToggleStatus_Done', ToggleStatusResult]

export type ToggleStatusResult = Result<'user_must_be_the_current_player' | 'must_be_in_game_started', SpaceModel>

//
//
//
//

export type InputPlayer = ['InputPlayer', Option<Player>]

export type InputPlayer_Done = ['InputPlayer_Done', Result<'must_be_in_game_setup', SpaceModel>]

export type StartGame = ['start-game']
export type StartGame_Done = ['StartGame_Done', Result<'must_be_in_game_setup' | 'missing_player', SpaceModel>]

export const canStartGame = (model: SpaceModel): boolean => {
  return model.gameStatus.type === 'GameSetup' && model.gameStatus.player.type === 'Some'
}

export const startGame = (model: SpaceModel): StartGame_Done[1] => {
  if (model.gameStatus.type !== 'GameSetup') {
    return Result.Err('must_be_in_game_setup')
  }

  if (model.gameStatus.player.type === 'none') {
    return Result.Err('missing_player')
  }

  const playerUserId = model.gameStatus.player.value[1]

  const modelNew: SpaceModel = {
    ...model,
    gameStatus: {
      type: 'GameStarted',
      player: ['User', playerUserId],
    },
  }

  return Result.Ok(modelNew)
}
