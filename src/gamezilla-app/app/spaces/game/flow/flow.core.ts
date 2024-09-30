import type { SpaceCtx } from 'gamezilla-app/app/spaces/@/space'
import type { WithEventMeta } from '../../@/event'
import { BuilderCore } from './builder/builder.core'
import type { ModelCore, MsgCore } from './flow.types'
import { PlayCore } from './play/play.core'

const initCore = (input: { ctx: SpaceCtx }): ModelCore => {
  return {
    mode: null,
    builder: BuilderCore.initCore(input),
    play: PlayCore.initCore(input)
  }
}

const updateCore = ({
  ctx,
  msgCore,
  modelCore
}: {
  ctx: SpaceCtx
  msgCore: WithEventMeta<MsgCore>
  modelCore: ModelCore
}): ModelCore => {
  switch (msgCore.t) {
    case 'play': {
      const updated = PlayCore.updateCore({
        ctx,
        msgCore: msgCore.c,
        modelCore: modelCore.play
      })

      switch (updated.event?.t) {
        case 'user-clicked-exit-mode-button': {
          return {
            ...modelCore,
            mode: null
          }
        }
      }

      return {
        ...modelCore,
        play: updated
      }
    }

    case 'builder': {
      const updated = BuilderCore.updateCore({
        ctx,
        msgCore: msgCore.c,
        modelCore: modelCore.builder
      })

      switch (updated.event?.t) {
        case 'user-clicked-exit-mode-button': {
          return {
            ...modelCore,
            mode: null
          }
        }
      }

      return {
        ...modelCore,
        builder: updated
      }
    }

    case 'user-changed-mode': {
      if (msgCore.userId !== ctx.space.hostId) {
        return modelCore
      }

      return {
        ...modelCore,
        mode: msgCore.mode,
        play: PlayCore.initCore({ ctx }),
        builder: BuilderCore.initCore({ ctx })
      }
    }
  }
}

export const FlowCore = {
  initCore,
  updateCore
}
