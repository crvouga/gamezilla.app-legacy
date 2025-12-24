import { TranslatedText } from '~/@/l18n'
import { TimeSpan } from '~/@/time/time-span'
import { APP_SOUND } from './app-sound'
import { PlaySoundCmd } from './play-sound-cmd.$msg'
import { ShowToastCmd } from './show-toast-cmd.$msg'
import { playSound } from './sound-cmd'
import { showToast } from './toaster-cmd'
import { Eff } from '~/@/eff'

const init = (text: TranslatedText, errorMsg?: string, duration?: TimeSpan): unknown[] => {
  return [
    ShowToastCmd.init(text, {
      variant: 'error',
      duration,
      errorMsg,
    }),
    PlaySoundCmd.init(APP_SOUND.alertErrorSm),
  ]
}

const did = (output?: { msgOut?: unknown[] | null }): boolean => {
  return ShowToastCmd.did(output) && PlaySoundCmd.did(output)
}

export const showErrorSmall =
  (text: TranslatedText, errorMsg?: string, duration?: TimeSpan): Eff =>
  (dispatch) => {
    playSound(APP_SOUND.alertErrorSm)(dispatch)
    showToast(text, 'error', duration, errorMsg)(dispatch)
  }

export const ShowErrorSmall = {
  init,
  did,
}
