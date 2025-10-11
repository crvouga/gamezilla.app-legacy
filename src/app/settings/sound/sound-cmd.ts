import { UnitInterval } from '~/@/range/unit-interval'
import { SoundTag } from '~/@/sound/sound-tag'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'

export type SoundCmd = {
  t: 'play-sound'
  src: string
  tag: SoundTag
  volume: UnitInterval
  delay: TimeSpan
}

export const soundCmd = Sub.queued<SoundCmd>()
