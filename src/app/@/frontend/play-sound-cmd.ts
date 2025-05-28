import { p } from '~/@/parser'
import { UnitInterval } from '~/@/range/unit-interval'
import { isOk } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'

export const parser = p.or(
  p.obj({
    t: p.l('play-sound'),
    src: p.str,
    volume: p.maybe(UnitInterval.parser),
    delay: p.maybe(TimeSpan.parser),
  }),
)

export type PlaySoundCmd = p.Infer<typeof parser>

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

export const PlaySoundCmd = {
  is,
  init,
  did,
}
