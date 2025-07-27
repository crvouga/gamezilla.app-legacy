import { AudioPlayerImplFake } from './impl-fake'
import { ImplWebStandard } from './impl-web-standard'
import { IAudioPlayer } from './interface'

export type AudioPlayer = ImplWebStandard | AudioPlayerImplFake

const init = (config: AudioPlayer): IAudioPlayer => {
  switch (config.t) {
    case 'web-standard':
      return ImplWebStandard.init(config)
    case 'fake':
      return AudioPlayerImplFake.init(config)
  }
}

export const AudioPlayer = {
  init,
}
