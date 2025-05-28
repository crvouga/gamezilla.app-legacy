import { p } from '~/@/schema'
import { isOk } from '~/@/result'

export const parser = p.or(
  p.obj({
    t: p.l('preload-sounds'),
    srcs: p.arr(p.str),
  }),
)

export type PreloadSoundsCmd = p.Infer<typeof parser>

export const init = (srcs: string[]): PreloadSoundsCmd => {
  return {
    t: 'preload-sounds',
    srcs,
  }
}

const is = (cmd: unknown): cmd is PreloadSoundsCmd => {
  return isOk(parser.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }, src?: string): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return src ? cmd.srcs.includes(src) : true
      }
      return false
    }),
  )
}

const count = (output?: { msgOut?: unknown[] | null }, src?: string): number => {
  return output?.msgOut?.filter((cmd) => is(cmd) && (src ? cmd.srcs.includes(src) : true)).length ?? 0
}

export const PreloadSoundsCmd = {
  is,
  init,
  did,
  count,
}
