import { p } from '~/@/parser'
import { isOk } from '~/@/result'

export const parser = p.or(
  p.obj({
    t: p.l('copy-to-clipboard'),
    text: p.str,
  }),
)

export type CopyToClipboardCmd = p.Infer<typeof parser>

export const init = (text: string): CopyToClipboardCmd => {
  return {
    t: 'copy-to-clipboard',
    text,
  }
}

const is = (cmd: unknown): cmd is CopyToClipboardCmd => {
  return isOk(parser.parse(cmd))
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
