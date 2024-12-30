import { Keyboard } from '~/@/browser'
import { type Result, isErr } from '~/@/result'
import { exhaustive } from '~/@/function/exhaustive'
import { Option } from '~/@/option/option'
import type { AppClientCtx } from '~/app/@/client'
import { SpaceClientCtx } from '../../@/space-client-ctx'
import { Direction } from './@/direction'
import {
  type CoreModel,
  type ModelClient,
  type ModelServer,
  type MsgClient,
  type MsgToClient,
  initCoreModel
} from './snake.types'
import { Eff } from '~/@/program/eff'
import { Sub } from '~/@/program/sub'

//
//
//
// Model
//
//
//

export type Model = ModelClient

export const init: Model = {
  ...initCoreModel,
  openedMenuId: Option.None
}

//
//
//
// Update
//
//
//

export type Msg = MsgClient

export const update = (
  {
    ctx
  }: {
    ctx: SpaceClientCtx
  },
  msg: Msg,
  _model: Model
): [Model, Eff<Msg>] => {
  const model: Model = {
    ..._model,
    openedMenuId: Option.None
  }

  switch (msg[0]) {
    case 'PressedKeyDown': {
      if (model.gameStatus.type !== 'GameStarted') {
        return [model, Eff.None]
      }

      if (model.gameStatus.player[1] !== ctx.currentUserId) {
        return [model, Eff.None]
      }

      const direction = Direction.fromKey(msg[1])

      const changeDirectionEff = direction.type === 'Some' ? Eff.None : Eff.None

      const toggleStatusEff = msg[1] === 'Space' ? Eff.None : Eff.None

      return [model, Eff.batch([changeDirectionEff, toggleStatusEff])]
    }

    case 'ToggleStatus': {
      return [model, Eff.None]
    }

    case 'InputPlayer': {
      return [model, Eff.None]
    }

    case 'input-direction': {
      return [model, Eff.None]
    }

    case 'start-game': {
      return [model, Eff.None]
    }

    case 'OpenedMenu': {
      return [
        {
          ...model,
          openedMenuId: Option.Some(msg[1])
        },
        Eff.None
      ]
    }

    case 'ClosedMenu': {
      return [
        {
          ...model,
          openedMenuId: Option.None
        },
        Eff.None
      ]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromServer = (msg: MsgToClient, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case 'tick': {
      const coreModel = msg[1]
      return [
        {
          ...coreModel,
          openedMenuId: model.openedMenuId
        },
        Eff.None
      ]
    }

    case 'InputDirection_Done': {
      return updateResponse(msg[1], model)
    }

    case 'ToggleStatus_Done': {
      return updateResponse(msg[1], model)
    }

    case 'InputPlayer_Done': {
      return updateResponse(msg[1], model)
    }

    case 'StartGame_Done': {
      return updateResponse(msg[1], model)
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

const updateResponse = <TProblem extends string, TResult extends Result<TProblem, CoreModel>>(
  result: TResult,
  model: Model
): [Model, Eff<Msg>] => {
  if (isErr(result)) {
    return [model, Eff.None]
  }
  const coreModel = result.value
  return [{ ...model, ...coreModel }, Eff.None]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_intervalId: string, _model: Model): Sub<Msg> => {
  return Keyboard.keyDowns<Msg>((key) => ['PressedKeyDown', key])
}

//
//
//
// View
//
//
//

export const View = ({ model, dispatch }: { ctx: AppClientCtx; model: Model; dispatch: (msg: Msg) => void }) => {
  if (model.gameStatus.type === 'GameSetup') {
    return <div />
  }

  return (
    <div>
      <ViewBoard model={model} dispatch={dispatch} />
    </div>
  )
}

export const ViewBoard = (_input: { model: Model; dispatch: (msg: Msg) => void }) => {
  return <canvas className='pointer-events-none h-full max-h-full min-h-full w-full touch-none select-none' />
}

export const mergeWithServer = ({
  clientModel,
  serverModel
}: {
  clientModel: ModelClient
  serverModel: ModelServer
}): ModelClient => {
  return {
    ...serverModel,
    openedMenuId: clientModel.openedMenuId
  }
}
