import type { EventMeta } from '~/@/event-sourced/event'
import { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/types'
import { NumberlinkSpace } from './numberlink/space'
import type { ModelSpace, MsgSpace } from './types'

export const initSpace = (input: { gameName: GameName; ctx: SpaceCtx }): ModelSpace => {
  switch (input.gameName) {
    case 'connect-four': {
      return {
        t: 'connect-four',
        c: ConnectFour.initSpace(),
      }
    }

    case 'numberlink': {
      return {
        t: 'numberlink',
        c: NumberlinkSpace.initSpace(input),
      }
    }

    default: {
      return {
        t: 'numberlink',
        c: NumberlinkSpace.initSpace(input),
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

    case 'numberlink': {
      switch (msgSpace.t) {
        case 'numberlink': {
          return {
            t: 'numberlink',
            c: NumberlinkSpace.updateSpace({
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
