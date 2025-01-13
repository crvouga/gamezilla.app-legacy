import type { EventMeta } from '~/@/event-sourced/event'
import { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/connect-four.types'
import { FlowSpace } from './flow/space'
import type { ModelSpace, MsgSpace } from './types'

export const initSpace = (input: { gameName: GameName; ctx: SpaceCtx }): ModelSpace => {
  switch (input.gameName) {
    case 'connect-four': {
      return {
        t: 'connect-four',
        c: ConnectFour.initSpace(),
      }
    }

    case 'flow': {
      return {
        t: 'flow',
        c: FlowSpace.initSpace(input),
      }
    }

    default: {
      return {
        t: 'flow',
        c: FlowSpace.initSpace(input),
      }
    }
  }
}

export const updateSpace = ({
  ctx,
  modelSpace,
  msgSpace,
}: {
  ctx: SpaceCtx
  modelSpace: ModelSpace
  msgSpace: MsgSpace & EventMeta
}): ModelSpace => {
  switch (modelSpace.t) {
    case 'connect-four': {
      switch (msgSpace.t) {
        case 'connect-four': {
          return {
            t: 'connect-four',
            c: ConnectFour.updateSpace({
              ctx,
              msgSpace: {
                ...msgSpace,
                ...msgSpace.c,
              },
              modelSpace: modelSpace.c,
            }),
          }
        }
        default: {
          return modelSpace
        }
      }
    }

    case 'flow': {
      switch (msgSpace.t) {
        case 'flow': {
          return {
            t: 'flow',
            c: FlowSpace.updateSpace({
              ctx,
              msgSpace: {
                ...msgSpace,
                ...msgSpace.c,
              },
              modelSpace: modelSpace.c,
            }),
          }
        }

        default: {
          return modelSpace
        }
      }
    }
  }
}
