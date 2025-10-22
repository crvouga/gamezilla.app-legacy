import { TranslatedText } from '~/@/l18n'
import { TimeSpan } from '~/@/time/time-span'
import { APP_SOUND } from './app-sound'
import { PlaySoundCmd } from './play-sound-cmd.$msg'
import { ShowToastCmd } from './show-toast-cmd.$msg'
import { playSound } from './sound-cmd'
import { showToast } from './toaster-cmd'
import { Eff } from '~/@/eff'

export const init = (text: TranslatedText, duration?: TimeSpan): unknown[] => {
  return [
    ShowToastCmd.init(text, {
      variant: 'info',
      duration,
    }),
    PlaySoundCmd.init(APP_SOUND.refreshFeed),
  ]
}

const did = (output?: { msgOut?: unknown[] | null }): boolean => {
  return ShowToastCmd.did(output) && PlaySoundCmd.did(output)
}

export const ShowOkSmall = {
  init,
  did,
}

export const showOkSmall =
  (text: TranslatedText, duration?: TimeSpan): Eff =>
  (dispatch) => {
    playSound(APP_SOUND.refreshFeed)(dispatch)
    showToast(text, 'info', duration)(dispatch)
  }
