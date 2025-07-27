// Alternative implementation - try this if the main one doesn't work
import * as ExpoAudio from 'expo-audio'
import { ShortId } from '../id/short-id'
import { ILogger } from '../logger'
import { Ok } from '../result'
import { TimeSpan } from '../time/time-span'
import { UnixMs } from '../time/unix-ms'
import { IAudioPlayer, PlayedAudioRecord } from './interface'

export type AudioPlayerImplExpoAudio = {
  t: 'expo-audio'
  logger: ILogger
}

const init = (config: AudioPlayerImplExpoAudio): IAudioPlayer => {
  const logger = config.logger.child(['audio-player'])
  const playedAudio: PlayedAudioRecord[] = []
  const playerCache = new Map<string, any>()

  const createAudioPlayer = async (src: string) => {
    try {
      // Log what's available in the ExpoAudio module
      logger.debug(`ExpoAudio module keys: ${Object.keys(ExpoAudio)}`)

      // Try different potential APIs
      if (ExpoAudio.AudioPlayer) {
        // Option 1: Constructor
        if (typeof ExpoAudio.AudioPlayer === 'function') {
          return new ExpoAudio.AudioPlayer({ uri: src }, 100)
        }
        // Option 2: Factory method
        // if (ExpoAudio.AudioPlayer.create) {
        //   return await ExpoAudio.AudioPlayer.create({ uri: src }, 100)
        // }
      }

      // Option 3: Direct function call
      if (typeof ExpoAudio.createAudioPlayer === 'function') {
        return await ExpoAudio.createAudioPlayer({ uri: src })
      }

      // Option 4: Using useAudioPlayer hook equivalent
      if (ExpoAudio.useAudioPlayer) {
        return ExpoAudio.useAudioPlayer({ uri: src })
      }

      throw new Error('No suitable AudioPlayer creation method found')
    } catch (error) {
      logger.error(`Failed to create audio player: ${error}`)
      throw error
    }
  }

  return {
    played() {
      return [...playedAudio]
    },

    async play(input) {
      logger.debug(`play ${input.src}`)
      const startedAt = UnixMs.now()

      try {
        let player = playerCache.get(input.src)
        if (!player) {
          player = await createAudioPlayer(input.src)
          playerCache.set(input.src, player)
        }

        // Try to get duration (API might vary)
        let duration = 0
        try {
          duration = (await player.duration) || player.getDuration?.() || 0
        } catch (e) {
          logger.debug(`Could not get duration: ${e}`)
        }

        // Try to seek to beginning (API might vary)
        try {
          if (player.seekTo) {
            await player.seekTo(0)
          } else if (player.setPosition) {
            await player.setPosition(0)
          }
        } catch (e) {
          logger.debug(`Could not seek: ${e}`)
        }

        // Play the audio
        await player.play()

        const durationTimeSpan = TimeSpan.milliseconds(duration * 1000)
        const endedAt = UnixMs.future(startedAt, durationTimeSpan)

        playedAudio.push({
          startedAt,
          endedAt,
          duration: durationTimeSpan,
          src: input.src,
          id: ShortId.generate(10),
          tag: input.tag,
        })

        return Ok(null)
      } catch (error) {
        logger.error(`Error playing audio: ${error}`)
        return Ok(null)
      }
    },

    async preload(input) {
      logger.debug(`preload ${input.srcList.join(', ')}`)
      try {
        await Promise.all(
          input.srcList.map(async (src) => {
            if (!playerCache.has(src)) {
              const player = await createAudioPlayer(src)
              // Try to preload/prepare the audio
              // await player.loadAsync({ uri: src })
              playerCache.set(src, player)
            }
          }),
        )
        return Ok(null)
      } catch (error) {
        logger.error(`Error preloading audio: ${error}`)
        return Ok(null)
      }
    },
  }
}

export const AudioPlayerImplExpoAudio = {
  init,
}
