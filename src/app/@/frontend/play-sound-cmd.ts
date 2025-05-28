import { s } from '~/@/schema'
import { UnitInterval } from '~/@/range/unit-interval'
import { isOk } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'

export const parser = s.or(
  s.obj({
    t: s.l('play-sound'),
    src: s.str,
    volume: s.maybe(UnitInterval.parser),
    delay: s.maybe(TimeSpan.parser),
  }),
)

export type PlaySoundCmd = s.Infer<typeof parser>

export const init = (
  src: string,
  config?: {
    volume?: UnitInterval
    delay?: TimeSpan
  },
): PlaySoundCmd => {
  return {
    t: 'play-sound',
    src,
    volume: config?.volume,
    delay: config?.delay,
  }
}

const is = (cmd: unknown): cmd is PlaySoundCmd => {
  return isOk(parser.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }, src?: string): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return src ? cmd.src === src : true
      }
      return false
    }),
  )
}

const count = (output?: { msgOut?: unknown[] | null }, src?: string): number => {
  return output?.msgOut?.filter((cmd) => is(cmd) && (src ? cmd.src === src : true)).length ?? 0
}

export const PlaySoundCmd = {
  is,
  init,
  did,
  count,
}
