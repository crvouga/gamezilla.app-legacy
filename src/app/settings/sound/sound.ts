import { Eff } from '~/@/eff'
import { Translator as SoundFrontend } from '~/@/l18n/generated'
import { isAnyMsg } from '~/@/msg/msg'
import { sleep } from '~/@/promise/sleep'
import { type Result } from '~/@/result'
import { IconVolumeHigh, IconVolumeXMark } from '~/@/ui/icon'
import { MenuItem } from '~/@/ui/menu-item'
import { SwitchButton } from '~/@/ui/switch-button'
import { h } from '~/@/vdom/h'
import { andThen } from '~/app/@/frontend/and-then'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PreloadSoundsCmd } from '~/app/@/frontend/preload-sounds-cmd.$msg'
import { ViewportVisibilityChangedEvt } from '~/app/@/frontend/viewport-visibility-changed-evt.$msg'

type Module = AppFrontendModule<{
  Ctx: AppFrontendCtxBase
  Model: Model
  Msg: Msg
}>

export type Model = {
  sound_muted: boolean
}

export const init: Module['init'] = () => {
  return {
    model: {
      sound_muted: false,
    },
  }
}

export type Msg =
  | {
      t: 'sound_toggleMute'
    }
  | {
      t: 'sound_playedSound'
      src: string
      result: Result<string, null>
    }
  | {
      t: 'sound_preloadedSounds'
      src: string[]
      result: Result<string, null>
    }

const isMsg = (msg: unknown): msg is Msg => {
  return isAnyMsg(msg) && msg.t.startsWith('sound_')
}

export const update = <T extends Model>(input: {
  ctx: AppFrontendCtxBase
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  eff?: Eff<Msg>
  msgOut?: unknown[]
} => {
  return andThen<T, Msg>(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
  )
}

const updateFromMsg: typeof update = (input) => {
  if (!isMsg(input.msg)) return { model: input.model }

  switch (input.msg.t) {
    case 'sound_toggleMute': {
      if (input.model.sound_muted) {
        return {
          model: { ...input.model, sound_muted: false },
          msgOut: [PlaySoundCmd.init(APP_SOUND.stateChangeUp)],
        }
      }

      return {
        model: {
          ...input.model,
          sound_muted: !input.model.sound_muted,
        },
      }
    }

    case 'sound_playedSound': {
      return { model: input.model }
    }

    case 'sound_preloadedSounds': {
      return { model: input.model }
    }
  }
}

const updateFromEvent: typeof update = (input) => {
  if (ViewportVisibilityChangedEvt.is(input.msgIn)) {
    return {
      model: {
        ...input.model,
        sound_muted: input.msgIn.state === 'hidden',
      },
    }
  }

  return { model: input.model }
}

const updateFromCmd: typeof update = (input) => {
  const { msgIn } = input

  if (PlaySoundCmd.is(msgIn)) {
    if (input.model.sound_muted) {
      return { model: input.model }
    }

    if (input.ctx.viewportVisibility === 'hidden') {
      return { model: input.model }
    }

    return {
      model: input.model,
      async eff(dispatch) {
        const { delay } = msgIn
        if (delay) await sleep(delay)
        const played = await input.ctx.audioPlayer.play({ src: msgIn.src, tag: msgIn.tag })
        dispatch({ t: 'sound_playedSound', src: msgIn.src, result: played })
      },
    }
  }

  if (PreloadSoundsCmd.is(msgIn)) {
    return {
      model: input.model,
      async eff(dispatch) {
        const preloaded = await input.ctx.audioPlayer.preload({ srcList: msgIn.srcList })
        dispatch({ t: 'sound_preloadedSounds', src: msgIn.srcList, result: preloaded })
      },
    }
  }

  return { model: input.model }
}

export const ViewIcon = (input: { model: Model; style: Record<string, unknown> }) => {
  if (input.model.sound_muted) return h(IconVolumeXMark, { style: input.style })
  return h(IconVolumeHigh, { style: input.style })
}

export const ViewSoundMenuItem = (props: {
  model: Model
  dispatch: (m: Msg) => void
  ctx: {
    t: SoundFrontend
  }
}) => {
  return h(MenuItem, {
    onPress: () =>
      props.dispatch({
        t: 'sound_toggleMute',
      }),
    renderIcon: (iconProps) => (props.model.sound_muted ? h(IconVolumeXMark, iconProps) : h(IconVolumeHigh, iconProps)),
    primary: props.model.sound_muted ? props.ctx.t('sound.sound-off') : props.ctx.t('sound.sound-on'),
    renderEnd: () =>
      h(SwitchButton, {
        label: 'toggle sound',
        checked: !props.model.sound_muted,
        onToggle: () => props.dispatch({ t: 'sound_toggleMute' }),
      }),
  })
}
