import { Eff } from '~/@/eff'
import { exhaustive } from '~/@/function/exhaustive'
import { Option } from '~/@/option/option'
import { type Result, isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { h } from '~/@/vdom/h'
import { AppFrontendCtx, AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { Direction } from './@/direction'
import {
  type ModelBackend,
  type ModelFrontend,
  type MsgFrontend,
  type MsgToFrontend,
  type SpaceModel,
  initSpaceModel,
} from './snake.types'

//
//
//
// Model
//
//
//

export type Model = ModelFrontend

export const init: Model = {
  ...initSpaceModel,
  openedMenuId: Option.None,
}

//
//
//
// Update
//
//
//

export type Msg = MsgFrontend

export const update = (
  {
    ctx,
  }: {
    ctx: SpaceFrontendCtx
  },
  msg: Msg,
  _model: Model,
): [Model, Eff<Msg>] => {
  const model: Model = {
    ..._model,
    openedMenuId: Option.None,
  }

  switch (msg[0]) {
    case 'PressedKeyDown': {
      if (model.gameStatus.type !== 'GameStarted') {
        return [model, Eff.None]
      }

      if (model.gameStatus.player[1] !== ctx.currentUser.userId) {
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
          openedMenuId: Option.Some(msg[1]),
        },
        Eff.None,
      ]
    }

    case 'ClosedMenu': {
      return [
        {
          ...model,
          openedMenuId: Option.None,
        },
        Eff.None,
      ]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromBackend = (msg: MsgToFrontend, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case 'tick': {
      const spaceModel = msg[1]
      return [
        {
          ...spaceModel,
          openedMenuId: model.openedMenuId,
        },
        Eff.None,
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

const updateResponse = <TProblem extends string, TResult extends Result<TProblem, SpaceModel>>(
  result: TResult,
  model: Model,
): [Model, Eff<Msg>] => {
  if (isErr(result)) {
    return [model, Eff.None]
  }
  const spaceModel = result.value
  return [{ ...model, ...spaceModel }, Eff.None]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (input: { ctx: AppFrontendCtxBase }): Sub<Msg> => {
  return input.ctx.keyboard.keyDowns<Msg>((key) => ['PressedKeyDown', key])
}

//
//
//
// View
//
//
//

export const View = ({ model, dispatch }: { ctx: AppFrontendCtx; model: Model; dispatch: (msg: Msg) => void }) => {
  if (model.gameStatus.type === 'GameSetup') {
    return h('div', {}, ['View'])
  }

  return h('div', {}, [h(ViewBoard, { model, dispatch })])
}

export const ViewBoard = (_input: { model: Model; dispatch: (msg: Msg) => void }) => {
  return h('canvas', {
    class: 'pointer-events-none h-full max-h-full min-h-full w-full touch-none select-none',
  })
}

export const mergeWithBackend = ({
  frontendModel,
  backendModel,
}: {
  frontendModel: ModelFrontend
  backendModel: ModelBackend
}): ModelFrontend => {
  return {
    ...backendModel,
    openedMenuId: frontendModel.openedMenuId,
  }
}
