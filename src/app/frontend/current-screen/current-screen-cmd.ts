import { Eff } from '~/@/eff'
import { Screen } from '~/@/screens/generated/screens'
import { Sub } from '~/@/sub'

export type CurrentScreenCmd =
  | {
      t: 'push'
      screen: Screen
      playSound?: boolean
      causedBy?: string
    }
  | {
      t: 'replace'
      screen: Screen
      playSound?: boolean
    }
  | {
      t: 'back'
      playSound?: boolean
    }

export const currentScreenCmds = Sub.queued<CurrentScreenCmd>()

export const pushScreen =
  (screen: Screen, playSound?: boolean, causedBy?: string): Eff =>
  () => {
    currentScreenCmds.pub({ t: 'push', screen, playSound, causedBy })
  }

export const replaceScreen =
  (screen: Screen, playSound?: boolean): Eff =>
  () => {
    currentScreenCmds.pub({ t: 'replace', screen, playSound })
  }

export const back =
  (playSound?: boolean): Eff =>
  () => {
    currentScreenCmds.pub({ t: 'back', playSound })
  }
