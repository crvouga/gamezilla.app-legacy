import { Eff } from '~/@/eff'
import { Translator as SoundFrontend } from '~/@/l18n/generated'
import { sleep } from '~/@/promise/sleep'
import { type Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { IconVolumeHigh, IconVolumeXMark } from '~/@/ui/icon'
import { MenuItem } from '~/@/ui/menu-item'
import { SwitchButton } from '~/@/ui/switch-button'
import { h } from '~/@/vdom/h'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { playSound, SoundCmd, soundCmds } from '~/app/@/frontend/sound-cmd'

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
  | {
      t: 'sound_gotSoundCmd'
      c: SoundCmd
    }

export const update = (input: {
  ctx: AppFrontendCtxBase
  model: Model
  msg: Msg
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'sound_toggleMute': {
      return {
        model: { sound_muted: !input.model.sound_muted },
        eff: () => playSound(APP_SOUND.stateChangeUp),
      }
    }

    case 'sound_playedSound': {
      return { model: input.model }
    }

    case 'sound_preloadedSounds': {
      return { model: input.model }
    }

    case 'sound_gotSoundCmd': {
      const cmd = input.msg.c

      switch (cmd.t) {
        case 'playSound': {
          if (input.model.sound_muted) {
            return { model: input.model }
          }

          if (input.ctx.viewportVisibility === 'hidden') {
            return { model: input.model }
          }

          return {
            model: input.model,
            async eff(dispatch) {
              const { delay } = cmd
              if (delay) await sleep(delay)
              const played = await input.ctx.audioPlayer.play({ src: cmd.src, tag: cmd.tag })
              dispatch({ t: 'sound_playedSound', src: cmd.src, result: played })
            },
          }
        }

        case 'preloadSounds': {
          const { srcList } = cmd
          return {
            model: input.model,
            async eff(dispatch) {
              const preloaded = await input.ctx.audioPlayer.preload({ srcList })
              dispatch({ t: 'sound_preloadedSounds', src: srcList, result: preloaded })
            },
          }
        }
      }
    }
  }
}

export const subscriptions = (_input: { ctx: AppFrontendCtxBase; model: Model }): Sub<Msg> => {
  return Sub.batch<Msg>([
    Sub.map(soundCmds, (c) => {
      return { t: 'sound_gotSoundCmd', c }
    }),
  ])
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
