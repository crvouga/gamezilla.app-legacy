import { Eff } from '~/@/eff'
import { Sound } from '~/@/sound/sound'
import { SoundTag } from '~/@/sound/sound-tag'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'

export type SoundCmd =
  | {
      t: 'playSound'
      src: string
      tag: SoundTag
      volume?: number
      delay?: TimeSpan
    }
  | {
      t: 'preloadSounds'
      srcList: string[]
    }

export const soundCmds = Sub.queued<SoundCmd>()

export const playSound =
  (sound: Sound, volume?: number, delay?: TimeSpan): Eff =>
  () => {
    soundCmds.pub({
      t: 'playSound',
      src: sound.src,
      tag: sound.tag,
      volume,
      delay,
    })
  }
