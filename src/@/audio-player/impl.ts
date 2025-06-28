import * as ImplFake from './impl-fake'
import * as ImplWebStandard from './impl-web-standard'
import { IAudioPlayer } from './interface'

export type Config = ImplWebStandard.Config | ImplFake.Config

export const AudioPlayer = (config: Config): IAudioPlayer => {
  switch (config.t) {
    case 'web-standard':
      return ImplWebStandard.AudioPlayer(config)
    case 'fake':
      return ImplFake.AudioPlayer(config)
  }
}
