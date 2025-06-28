import { ShortId } from '../id/short-id'
import { ILogger } from '../logger'
import { Ok } from '../result'
import { TimeSpan } from '../time/time-span'
import { UnixMs } from '../time/unix-ms'
import { IAudioPlayer, PlayedAudioRecord } from './interface'

export type Config = {
  t: 'fake'
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
      const endedAt = null
      const duration = TimeSpan.seconds(0)
      playedAudio.push({ startedAt, endedAt, duration, src: input.src, id: ShortId.generate(10) })
      return Ok(null)
    },
    async preload(input) {
      logger.debug(`preload ${input.srcList.join(', ')}`)
      return Ok(null)
    },
  }
}
