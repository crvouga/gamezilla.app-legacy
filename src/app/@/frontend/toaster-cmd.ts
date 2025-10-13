import { Eff } from '~/@/eff'
import { TranslatedText } from '~/@/l18n'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'

export type ToasterCmd = {
  t: 'showToast'
  text: TranslatedText
  variant?: 'error' | 'info' | 'success'
  duration?: TimeSpan
  errorMsg?: string
}

export const toasterCmds = Sub.queued<ToasterCmd>()

export const showToast =
  (text: TranslatedText, variant?: 'error' | 'info' | 'success', duration?: TimeSpan, errorMsg?: string): Eff =>
  () => {
    toasterCmds.pub({
      t: 'showToast',
      text,
      variant,
      duration,
      errorMsg,
    })
  }
