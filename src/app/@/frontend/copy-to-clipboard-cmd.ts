import { s } from '~/@/schema'
import { isOk } from '~/@/result'

export const schema = s.or(
  s.obj({
    t: s.l('copy-to-clipboard'),
    text: s.str(),
  }),
)

export type CopyToClipboardCmd = s.Infer<typeof schema>

export const init = (text: string): CopyToClipboardCmd => {
  return {
    t: 'copy-to-clipboard',
    text,
  }
}

const is = (cmd: unknown): cmd is CopyToClipboardCmd => {
  return isOk(schema.parse(cmd))
}

const did = (output?: { msgOut?: unknown[] | null }, predicate?: (copiedText: string) => boolean): boolean => {
  return Boolean(
    output?.msgOut?.some((cmd) => {
      if (is(cmd)) {
        return predicate ? predicate(cmd.text) : true
      }
      return false
    }),
  )
}

export const CopyToClipboardCmd = {
  is,
  init,
  did,
}
