import type { WithEventMeta } from '~/@/event-sourced/event'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { NumberlinkSpaceCtx } from './@/space/ctx'
import { BuildSpace } from './screen-build/space'
import { PlaySpace } from './screen-play/space'
import type { ModelSpace, MsgSpace } from './types'

const initSpace = (input: { ctx: SpaceCtx }): ModelSpace => {
  const ctx: NumberlinkSpaceCtx = input.ctx
  return {
    numberlink_mode: 'none',
    numberlink_screenBuild: BuildSpace.initSpace({ ctx }),
    numberlink_screenPlay: PlaySpace.initSpace({ ctx }),
  }
}

const updateSpace = (input: {
  ctx: SpaceCtx
  msgSpace: WithEventMeta<MsgSpace>
  modelSpace: ModelSpace
}): ModelSpace => {
  const ctx: NumberlinkSpaceCtx = input.ctx
  switch (input.msgSpace.t) {
    case 'got-screen-play-msg': {
      const updated = PlaySpace.updateSpace({
        ctx,
        msgSpace: input.msgSpace.c,
        modelSpace: input.modelSpace.numberlink_screenPlay,
      })

      switch (updated.event?.t) {
        case 'user-clicked-exit-mode-button': {
          return { ...input.modelSpace, numberlink_screenPlay: updated, numberlink_mode: 'none' }
        }
        default: {
          return { ...input.modelSpace, numberlink_screenPlay: updated }
        }
      }
    }

    case 'got-screen-build-msg': {
      const updated = BuildSpace.updateSpace({
        ctx,
        msgSpace: input.msgSpace.c,
        modelSpace: input.modelSpace.numberlink_screenBuild,
      })

      switch (updated.event?.t) {
        case 'user-clicked-exit-mode-button': {
          return { ...input.modelSpace, numberlink_screenBuild: updated, numberlink_mode: 'none' }
        }
        default: {
          return { ...input.modelSpace, numberlink_screenBuild: updated }
        }
      }
    }

    case 'numberlink_userChangedMode': {
      if (input.msgSpace.userId !== ctx.space.hostId) {
        return input.modelSpace
      }

      return {
        ...input.modelSpace,
        numberlink_mode: input.msgSpace.mode,
        numberlink_screenPlay: PlaySpace.initSpace({ ctx }),
        numberlink_screenBuild: BuildSpace.initSpace({ ctx }),
      }
    }
  }
}

export const NumberlinkSpace = {
  initSpace,
  updateSpace,
}
