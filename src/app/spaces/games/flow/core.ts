import type { SpaceCtx } from '~/app/spaces/@/space-ctx'
import type { WithEventMeta } from '~/@/event-sourced/event'
import { BuilderCore } from './builder/core'
import type { ModelCore, MsgCore } from './types'
import { PlayCore } from './play/core'

const initCore = (input: { ctx: SpaceCtx }): ModelCore => {
  return {
    mode: 'none',
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
            mode: 'none'
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
            mode: 'none'
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
