import { Translator as SoundFrontend } from '~/@/l18n/generated'
import { sleep } from '~/@/promise/sleep'
import { UnitInterval } from '~/@/range/unit-interval'
import { Err, Ok, type Result } from '~/@/result'
import { IconVolumeHigh, IconVolumeXMark, ListItemButton, ToggleButton } from '~/@/ui'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { APP_SOUND, SoundCmd, playSound } from '~/app/@/frontend/cmd'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { AppFrontendEvt } from '~/app/@/frontend/evt'

//
//
//
//
//
//
//

type Module = AppFrontendModule<{
  Ctx: AppFrontendCtxBase
  MsgCmdIn: SoundCmd
  MsgEvtIn: AppFrontendEvt
  Model: Model
  Msg: Msg
  MsgCmdOut: SoundCmd
  MsgEvtOut: never
  MsgToFrontend: never
  MsgToBackend: never
}>

//
//
//
//
// Model
//
//
//
//

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

//
//
//
//
// Update
//
//
//
//

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
  if (!input.msg) {
    return { model: input.model }
  }

  switch (input.msg.t) {
    case 'toggle-mute': {
      if (input.model.muted) {
        return {
          model: { ...input.model, muted: false },
          msgCmd: [playSound(APP_SOUND.stateChangeUp)],
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
  if (!input.msgEvt) {
    return { model: input.model }
  }

  switch (input.msgEvt.t) {
    case 'platform-evt.document-visibility-changed': {
      return {
        model: {
          ...input.model,
          muted: input.msgEvt.state === 'hidden',
        },
      }
    }

    default: {
      return { model: input.model }
    }
  }
}

export const updateFromCmd: Module['update'] = (input) => {
  if (!input.msgCmd) {
    return { model: input.model }
  }

  const soundCmd = input.msgCmd.c

  switch (soundCmd.t) {
    case 'preload': {
      return {
        model: input.model,
        async eff(dispatch) {
          const preloaded = await preloadSoundsEffect(soundCmd.src)
          dispatch({ t: 'preloaded-sounds', src: soundCmd.src, result: preloaded })
        },
      }
    }
    case 'play': {
      if (input.model.muted) {
        return { model: input.model }
      }

      if (input.ctx.documentVisibilityState === 'hidden') {
        return { model: input.model }
      }

      return {
        model: input.model,
        async eff(dispatch) {
          const { delay } = soundCmd
          if (delay) {
            await sleep(delay)
          }
          const played = await playSoundEffect(soundCmd.src, soundCmd.volume ?? UnitInterval.init(1))
          dispatch({ t: 'played-sound', src: soundCmd.src, result: played })
        },
      }
    }
  }
}

export const ViewIcon = (input: { model: Model; className: string }) => {
  if (input.model.muted) {
    return <IconVolumeXMark className={input.className} />
  }

  return <IconVolumeHigh className={input.className} />
}

export const ViewSoundListItem = (input: {
  model: Model
  dispatch: (m: Msg) => void
  ctx: {
    t: SoundFrontend
  }
}) => {
  return (
    <ListItemButton
      onClick={() =>
        input.dispatch({
          t: 'toggle-mute',
        })
      }
      icon={(inputIcon) => (input.model.muted ? <IconVolumeXMark {...inputIcon} /> : <IconVolumeHigh {...inputIcon} />)}
      label={input.model.muted ? input.ctx.t('sound.sound-off') : input.ctx.t('sound.sound-on')}
      end={() => <ToggleButton label='toggle sound' checked={!input.model.muted} id='toggle-sound' />}
    />
  )
}

//
//
//
//
//
// Web Audio
//
//
//
//
//

const MyAudioContext = (): typeof window.AudioContext => {
  return (
    window.AudioContext ||
    // @ts-expect-error - webkitAudioContext is not in the types
    window.webkitAudioContext
  )
}

const nextUserGesture = async () => {
  await new Promise((resolve) => {
    const handler = async () => {
      resolve(null)
      document.body.removeEventListener('click', handler)
      document.body.removeEventListener('touchstart', handler)
    }

    document.body.addEventListener('click', handler, { once: true })
    document.body.addEventListener('touchstart', handler, { once: true })
  })
}

let _didUserGesture = false
const awaitUserGesture = async () => {
  if (!_didUserGesture) {
    await nextUserGesture()
    _didUserGesture = true
    return false
  }
  return true
}

let _audioContext: AudioContext
const getAudioContext = async (): Promise<AudioContext | null> => {
  await awaitUserGesture()

  if (!_audioContext) {
    _audioContext = new (MyAudioContext())()
  }

  return _audioContext
}

const audioBuffers = new Map<string, AudioBuffer>()

const preloadSoundsEffect = async (src: string[]) => {
  await Promise.allSettled(src.map((s) => preloadSoundEffect(s)))
  return Ok(null)
}

const preloadSoundEffect = async (src: string) => {
  try {
    const response = await fetch(src)
    const arrayBuffer = await response.arrayBuffer()
    const audioContext = await getAudioContext()
    if (!audioContext) {
      return Err('No audio context')
    }
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    audioBuffers.set(src, audioBuffer)
    return Ok(null)
  } catch (e) {
    return Err(String(e))
  }
}

const playSoundEffect = async (src: string, volume: UnitInterval): Promise<Result<string, null>> => {
  try {
    const audioContext = await getAudioContext()
    if (!audioContext) {
      return Err('No audio context')
    }
    const audioBuffer = audioBuffers.get(src)
    if (audioBuffer) {
      return playSoundEffect_(audioContext, audioBuffer, volume)
    }
    const response = await fetch(src)
    const arrayBuffer = await response.arrayBuffer()
    const audioBufferNew = await audioContext.decodeAudioData(arrayBuffer)
    audioBuffers.set(src, audioBufferNew)
    // return playSoundEffect_(audioContext, audioBufferNew, volume)
    return Ok(null)
  } catch (e) {
    return Err(String(e))
  }
}

const playSoundEffect_ = async (
  audioContext: AudioContext,
  audioBuffer: AudioBuffer,
  volume: UnitInterval,
): Promise<Result<string, null>> => {
  try {
    const sourceNode = audioContext.createBufferSource()
    sourceNode.buffer = audioBuffer
    const gainNode = audioContext.createGain()
    gainNode.gain.value = volume

    sourceNode.connect(gainNode)
    gainNode.connect(audioContext.destination)

    sourceNode.start(0)

    return Ok(null)
  } catch (e) {
    return Err(String(e))
  }
}
