import { ShortId } from '../id/short-id'
import { ILogger } from '../logger'
import { UnitInterval } from '../range/unit-interval'
import { Err, Ok, Result } from '../result'
import { UnixMs } from '../time/unix-ms'
import { IAudioPlayer, PlayedAudioRecord } from './interface'

export type Config = {
  t: 'web-standard'
  logger: ILogger
}

export const AudioPlayer = (config: Config): IAudioPlayer => {
  const logger = config.logger.child(['audio-player'])
  const playedAudio: PlayedAudioRecord[] = []
  return {
    played() {
      return [...playedAudio]
    },
    async play(input) {
      logger.debug(`play ${input.src}`)
      const startedAt = UnixMs.now()
      const played = await playSoundEffect(input.src, UnitInterval.init(0.5))
      const endedAt = UnixMs.now()
      const duration = UnixMs.diff(endedAt, startedAt)
      playedAudio.push({ startedAt, endedAt, duration, src: input.src, id: ShortId.generate(10), tag: input.tag })
      return played
    },
    async preload(input) {
      logger.debug(`preload ${input.srcList.join(', ')}`)
      return preloadSoundsEffect(input.srcList)
    },
  }
}

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

const preloadSoundsEffect = async (src: string[]): Promise<Result<string, null>> => {
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
