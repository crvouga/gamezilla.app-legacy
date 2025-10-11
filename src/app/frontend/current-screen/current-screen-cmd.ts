import { Screen } from '~/@/screens/generated/screens'
import { Sub } from '~/@/sub'

export type CurrentScreenCmd = {
  t: 'pushScreen'
  c: Screen
}

export const currentScreenCmd = Sub.init<CurrentScreenCmd>()
