import { Result } from '../result'
import { SoundTag } from '../sound/sound-tag'
import { TimeSpan } from '../time/time-span'
import { UnixMs } from '../time/unix-ms'

export type PlayedAudioRecord = {
  id: string
  startedAt: UnixMs
  endedAt: UnixMs | null
  duration: TimeSpan
  src: string
  tag: SoundTag
}

export type IAudioPlayer = {
  play: (input: { src: string; tag: SoundTag }) => Promise<Result<string, null>>
  preload: (input: { srcList: string[] }) => Promise<Result<string, null>>
  played: () => PlayedAudioRecord[]
}
