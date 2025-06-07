import type { WithEventMeta } from '~/@/event-sourced/event'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { NumberlinkSpaceCtx } from './@/space/ctx'
import { BuildSpace } from './screen-build/space'
import { PlaySpace } from './screen-play/space'
import type { ModelSpace, MsgSpace } from './types'

const initSpace = (input: { ctx: SpaceCtx }): ModelSpace => {
  const ctx: NumberlinkSpaceCtx = input.ctx
  return {
    mode: 'none',
    screenBuild: BuildSpace.initSpace({ ctx }),
    screenPlay: PlaySpace.initSpace({ ctx }),
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
        modelSpace: input.modelSpace.screenPlay,
      })

      switch (updated.event?.t) {
        case 'user-clicked-exit-mode-button': {
          return { ...input.modelSpace, screenPlay: updated, mode: 'none' }
        }
        default: {
          return { ...input.modelSpace, screenPlay: updated }
        }
      }
    }

    case 'got-screen-build-msg': {
      const updated = BuildSpace.updateSpace({
        ctx,
        msgSpace: input.msgSpace.c,
        modelSpace: input.modelSpace.screenBuild,
      })

      switch (updated.event?.t) {
        case 'user-clicked-exit-mode-button': {
          return { ...input.modelSpace, screenBuild: updated, mode: 'none' }
        }
        default: {
          return { ...input.modelSpace, screenBuild: updated }
        }
      }
    }

    case 'user-changed-mode': {
      if (input.msgSpace.userId !== ctx.space.hostId) {
        return input.modelSpace
      }

      return {
        ...input.modelSpace,
        mode: input.msgSpace.mode,
        screenPlay: PlaySpace.initSpace({ ctx }),
        screenBuild: BuildSpace.initSpace({ ctx }),
      }
    }
  }
}

export const NumberlinkSpace = {
  initSpace,
  updateSpace,
}
