import { SoundTag } from './sound-tag'

export type Sound = {
  src: string
  tag: SoundTag
}

const init = (src: string, tag: SoundTag): Sound => {
  return { src, tag }
}

export const Sound = { init }
