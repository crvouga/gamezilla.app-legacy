import { Screen } from '~/@/screens/generated/screens'
import { Sub } from '~/@/sub'

export type CurrentScreenEvt = {
  t: 'screenChanged'
  screen: Screen
}

export const currentScreenEvts = Sub.queued<CurrentScreenEvt>()
