import { Sub } from '~/@/sub'

export type CopyToClipboardCmd = {
  t: 'copyToClipboard'
  text: string
}

export const copyToClipboardCmds = Sub.queued<CopyToClipboardCmd>()
