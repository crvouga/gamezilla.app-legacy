import { Err, Ok, TimeSpan, UnitInterval, type Result } from '~/@/core'
import { Translator } from '~/@/l18n/generated'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { APP_SOUND, BaseClientCtx, playSound, type ClientEvt, type SoundCmd } from '~/app/@/client'
import { IconVolumeHigh, IconVolumeXMark, ListItemButton, ToggleButton } from '~/app/@/ui'

//
//
//
//
//
//
//

type Module = AppClientModule<{
  Ctx: BaseClientCtx
  MsgCmdIn: SoundCmd
  MsgEvtIn: ClientEvt
  Model: Model
  Msg: Msg
  MsgCmdOut: SoundCmd
  MsgEvtOut: never
  MsgToClient: never
  MsgToServer: never
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
  isDocumentVisible: boolean
}

export const init: Module['init'] = () => {
  return {
    model: {
      muted: false,
      isDocumentVisible: false
    }
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
  return AppClientModule.andThen(
    { model: input.model },
    (model) =>
      updateFromMsg({
        ...input,
        model
      }),
    (model) =>
      updateFromCmd({
        ...input,
        model
      }),
    (model) =>
      updateFromEvent({
        ...input,
        model
      })
  )
}

const updateFromMsg: Module['update'] = ({ msg, model }) => {
  if (!msg) {
    return { model }
  }

  switch (msg.t) {
    case 'toggle-mute': {
      if (model.muted) {
        return {
          model: {
            ...model,
            muted: false
          },
          msgCmd: [playSound(APP_SOUND.stateChangeUp)]
        }
      }
      return {
        model: {
          ...model,
          muted: !model.muted
        }
      }
    }
    case 'played-sound': {
      return {
        model
      }
    }
    case 'preloaded-sounds': {
      return {
        model
      }
    }
  }
}

const updateFromEvent: Module['update'] = ({ model, msgEvt }) => {
  if (!msgEvt) {
    return { model }
  }

  switch (msgEvt.t) {
    case 'platform/document-visibility-changed': {
      return {
        model: {
          ...model,
          muted: msgEvt.state === 'hidden'
        }
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

export const updateFromCmd: Module['update'] = ({ model, msgCmd, ctx }) => {
  if (!msgCmd) {
    return { model }
  }

  const soundCmd = msgCmd.c

  switch (soundCmd.t) {
    case 'preload': {
      return {
        model,
        eff: async (dispatch) => {
          const preloaded = await preloadSoundsEffect(soundCmd.src)
          dispatch({
            t: 'preloaded-sounds',
            src: soundCmd.src,
            result: preloaded
          })
        }
      }
    }
    case 'play': {
      if (model.muted) {
        return {
          model
        }
      }

      if (ctx.documentVisibilityState === 'hidden') {
        return {
          model
        }
      }

      return {
        model,
        eff: async (dispatch) => {
          const { delay } = soundCmd

          if (delay) {
            await new Promise((r) => setTimeout(r, TimeSpan.toMilliseconds(delay)))
          }
          const played = await playSoundEffect(soundCmd.src, soundCmd.volume ?? UnitInterval.init(1))
          dispatch({
            t: 'played-sound',
            src: soundCmd.src,
            result: played
          })
        }
      }
    }
  }
}

export const ViewStatusBar = (input: { model: Model }) => {
  if (input.model.muted) {
    return <IconVolumeXMark className='h-4 w-4' />
  }

  return <IconVolumeHigh className='h-4 w-4' />
}

export const ViewStatusBarDrawer = (input: {
  model: Model
  dispatch: (m: Msg) => void
  ctx: {
    t: Translator
  }
}) => {
  return (
    <ListItemButton
      onClick={() =>
        input.dispatch({
          t: 'toggle-mute'
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
    // @ts-ignore
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

    document.body.addEventListener('click', handler)
    document.body.addEventListener('touchstart', handler)
  })
}

let _audioContext: AudioContext
let _didUserGesture = false
const getAudioContext = async () => {
  if (!_didUserGesture) {
    await nextUserGesture()
    _didUserGesture = true
  }

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
  const response = await fetch(src)
  const arrayBuffer = await response.arrayBuffer()
  const audioContext = await getAudioContext()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  audioBuffers.set(src, audioBuffer)
  return Ok(null)
}

const playSoundEffect = async (src: string, volume: number): Promise<Result<string, null>> => {
  const audioBuffer = audioBuffers.get(src)

  if (!audioBuffer) {
    return Err(`Sound not loaded. src: ${src}`)
  }
  const audioContext = await getAudioContext()
  const sourceNode = audioContext.createBufferSource()
  sourceNode.buffer = audioBuffer
  const gainNode = audioContext.createGain()
  gainNode.gain.value = volume

  sourceNode.connect(gainNode)
  gainNode.connect(audioContext.destination)

  sourceNode.start(0)

  return Ok(null)
}
