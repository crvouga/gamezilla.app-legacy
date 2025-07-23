import { ImplFake } from './impl-fake'
import { ImplWebStandard } from './impl-web-standard'
import { IAudioPlayer } from './interface'

export type AudioPlayer = ImplWebStandard | ImplFake

const init = (config: AudioPlayer): IAudioPlayer => {
  switch (config.t) {
    case 'web-standard':
      return ImplWebStandard.init(config)
    case 'fake':
      return ImplFake.init(config)
  }
}

export const AudioPlayer = {
  init,
}
