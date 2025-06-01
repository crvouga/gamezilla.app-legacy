import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import * as Board from '../@/chess/chess-space'
import { initSpace, type ModelBackend, type MsgBackend, type MsgToBackend } from './vs-user.types'

//
//
//
// Model
//
//
//

export const init = initSpace

//
//
//
// Update
//
//
//

export const update = (_msg: MsgBackend, model: ModelBackend): { model: ModelBackend } => {
  return { model }
}

export const updateFromFrontend = (
  _msg: MsgToBackend,
  model: ModelBackend,
): {
  model: ModelBackend
  eff?: Eff<MsgBackend>
} => {
  return { model }
}

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceBackendEvt
  model: ModelBackend
}): {
  model: ModelBackend
  eff?: Eff<MsgBackend>
} => {
  if (msg.t === 'space-evt.user-left-space') {
    switch (model.type) {
      case 'setup': {
        const { userId } = msg
        const color: Board.Color | 'none' = model.b === userId ? 'b' : model.w === userId ? 'w' : 'none'

        if (color === 'none') {
          return {
            model,
          }
        }

        const modelNew: ModelBackend = {
          ...model,
          [color]: 'none',
        }

        return {
          model: modelNew,
        }
      }

      case 'game':
      case 'game-over': {
        const { userId } = msg

        const color: Board.Color | 'none' = model.b === userId ? 'b' : model.w === userId ? 'w' : 'none'

        if (color === 'none') {
          return {
            model,
          }
        }

        const otherColor = Board.toOppositeColor(color)

        const modelNew: ModelBackend = {
          ...model,
          type: 'setup',
          clockPreset: model.clock.preset,
          [otherColor]: model[otherColor],
          [color]: 'none',
        }

        return {
          model: modelNew,
        }
      }
    }
  }
  return { model }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: ModelBackend): Sub<MsgBackend> => {
  switch (model.type) {
    case 'setup': {
      return Sub.none()
    }

    case 'game-over': {
      return Sub.none()
    }

    case 'game': {
      const turn = Board.toTurn(model.board)

      switch (turn) {
        case 'b': {
          return Time.interval(`${intervalId}-b`, TimeSpan.milliseconds(1000), () => ['ClockTicked'])
        }
        case 'w': {
          return Time.interval(`${intervalId}-w`, TimeSpan.milliseconds(1000), () => ['ClockTicked'])
        }
      }
    }
  }
}
