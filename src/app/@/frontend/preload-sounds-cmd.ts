import { s } from '~/@/schema'
import { isOk } from '~/@/result'

export const schema = s.or(
  s.obj({
    t: s.l('preload-sounds'),
    srcList: s.arr(s.str()),
  }),
)

export type PreloadSoundsCmd = s.Infer<typeof schema>

export const init = (srcList: string[]): PreloadSoundsCmd => {
  return {
    t: 'preload-sounds',
    srcList,
  }
}

const is = (cmd: unknown): cmd is PreloadSoundsCmd => {
  return isOk(schema.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }, src?: string): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return src ? cmd.srcList.includes(src) : true
      }
      return false
    }),
  )
}

const count = (output?: { msgOut?: unknown[] | null }, src?: string): number => {
  return output?.msgOut?.filter((cmd) => is(cmd) && (src ? cmd.srcList.includes(src) : true)).length ?? 0
}

export const PreloadSoundsCmd = {
  is,
  init,
  did,
  count,
}
