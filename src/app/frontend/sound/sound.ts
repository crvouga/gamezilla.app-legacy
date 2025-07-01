import { Translator as SoundFrontend } from '~/@/l18n/generated'
import { sleep } from '~/@/promise/sleep'
import { type Result } from '~/@/result'
import { IconVolumeHigh, IconVolumeXMark } from '~/@/ui/icon'
import { ListItemButton } from '~/@/ui/list-item-button'
import { ToggleButton } from '~/@/ui/toggle-button'
import { v } from '~/@/vdom/v'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { DocumentVisibilityChangedEvt } from '~/app/@/frontend/document-visibility-changed-evt.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PreloadSoundsCmd } from '~/app/@/frontend/preload-sounds-cmd.$msg'

type Module = AppFrontendModule<{
  Ctx: AppFrontendCtxBase
  Model: Model
  Msg: Msg
  MsgEvtOut: never
  MsgToFrontend: never
  MsgToBackend: never
}>

export type Model = {
  muted: boolean
}

export const init: Module['init'] = () => {
  return {
    model: {
      muted: false,
    },
  }
}

export type Msg =
  | {
      t: 'toggle-mute'
    }
  | {
      t: 'played-sound'
      src: string
      result: Result<string, null>
    }
  | {
      t: 'preloaded-sounds'
      src: string[]
      result: Result<string, null>
    }

export const update: Module['update'] = (input) => {
  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
  )
}

const updateFromMsg: Module['update'] = (input) => {
  if (!input.msg) return { model: input.model }

  switch (input.msg.t) {
    case 'toggle-mute': {
      if (input.model.muted) {
        return {
          model: { ...input.model, muted: false },
          msgOut: [PlaySoundCmd.init(APP_SOUND.stateChangeUp)],
        }
      }

      return {
        model: {
          ...input.model,
          muted: !input.model.muted,
        },
      }
    }

    case 'played-sound': {
      return { model: input.model }
    }

    case 'preloaded-sounds': {
      return { model: input.model }
    }
  }
}

const updateFromEvent: Module['update'] = (input) => {
  if (DocumentVisibilityChangedEvt.is(input.msgIn)) {
    return {
      model: {
        ...input.model,
        muted: input.msgIn.state === 'hidden',
      },
    }
  }

  return { model: input.model }
}

export const updateFromCmd: Module['update'] = (input) => {
  const { msgIn } = input

  if (PlaySoundCmd.is(msgIn)) {
    if (input.model.muted) {
      return { model: input.model }
    }

    if (input.ctx.documentVisibilityState === 'hidden') {
      return { model: input.model }
    }

    return {
      model: input.model,
      async eff(dispatch) {
        const { delay } = msgIn
        if (delay) await sleep(delay)
        const played = await input.ctx.audioPlayer.play({ src: msgIn.src, tag: msgIn.tag })
        dispatch({ t: 'played-sound', src: msgIn.src, result: played })
      },
    }
  }

  if (PreloadSoundsCmd.is(msgIn)) {
    return {
      model: input.model,
      async eff(dispatch) {
        const preloaded = await input.ctx.audioPlayer.preload({ srcList: msgIn.srcList })
        dispatch({ t: 'preloaded-sounds', src: msgIn.srcList, result: preloaded })
      },
    }
  }

  return { model: input.model }
}

export const ViewIcon = (input: { model: Model; class: string }) => {
  if (input.model.muted) {
    return v(IconVolumeXMark, { class: input.class })
  }

  return v(IconVolumeHigh, { class: input.class })
}

export const ViewSoundListItem = (input: {
  model: Model
  dispatch: (m: Msg) => void
  ctx: {
    t: SoundFrontend
  }
}) => {
  return v(ListItemButton, {
    onClick: () =>
      input.dispatch({
        t: 'toggle-mute',
      }),
    icon: (inputIcon) => (input.model.muted ? v(IconVolumeXMark, inputIcon) : v(IconVolumeHigh, inputIcon)),
    label: input.model.muted ? input.ctx.t('sound.sound-off') : input.ctx.t('sound.sound-on'),
    end: () => v(ToggleButton, { label: 'toggle sound', checked: !input.model.muted, id: 'toggle-sound' }),
  })
}
