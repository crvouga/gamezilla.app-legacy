import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'

export type FocusCmd = {
  t: 'focus'
  viewId: string
}

export const focusCmds = Sub.queued<FocusCmd>()

export const focus =
  (viewId: string): Eff =>
  () => {
    focusCmds.pub({ t: 'focus', viewId })
  }
