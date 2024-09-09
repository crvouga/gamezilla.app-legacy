import type { EventMeta } from 'gamezilla-app/app/spaces/@/event'
import type { SpaceCtx } from '../@/space'
import * as ConnectFour from './connect-four/connect-four.types'
import * as Flow from './flow/flow.core'
import type { ModelCore, MsgCore } from './game.types'
import { GameName } from './@/game-name'

export const initCore = (input: { gameName: GameName; ctx: SpaceCtx }): ModelCore => {
  switch (input.gameName) {
    case 'connect-four': {
      return {
        t: 'connect-four',
        c: ConnectFour.initCore()
      }
    }

    case 'flow': {
      return {
        t: 'flow',
        c: Flow.initCore(input)
      }
    }

    default: {
      return {
        t: 'flow',
        c: Flow.initCore(input)
      }
    }
  }
}

export const updateCore = ({
  ctx,
  modelCore,
  msgCore
}: {
  ctx: SpaceCtx
  modelCore: ModelCore
  msgCore: MsgCore & EventMeta
}): ModelCore => {
  switch (modelCore.t) {
    case 'connect-four': {
      switch (msgCore.t) {
        case 'connect-four': {
          return {
            t: 'connect-four',
            c: ConnectFour.updateCore({
              ctx,
              msgCore: {
                ...msgCore,
                ...msgCore.c
              },
              modelCore: modelCore.c
            })
          }
        }
        default: {
          return modelCore
        }
      }
    }

    case 'flow': {
      switch (msgCore.t) {
        case 'flow': {
          return {
            t: 'flow',
            c: Flow.updateCore({
              ctx,
              msgCore: {
                ...msgCore,
                ...msgCore.c
              },
              modelCore: modelCore.c
            })
          }
        }

        default: {
          return modelCore
        }
      }
    }
  }
}
