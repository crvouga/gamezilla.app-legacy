import { TranslatedText } from '~/@/l18n'
import { TimeSpan } from '~/@/time/time-span'
import { APP_SOUND } from './app-sound'
import { PlaySoundCmd } from './play-sound-cmd'
import { ShowToastCmd } from './show-toast-cmd'

const init = (text: TranslatedText, errorMsg?: string, duration?: TimeSpan): unknown[] => {
  return [
    ShowToastCmd.init(text, {
      variant: 'info',
      duration,
      errorMsg,
    }),
    PlaySoundCmd.init(APP_SOUND.alertErrorSm),
  ]
}

const did = (output?: { msgOut?: unknown[] | null }): boolean => {
  return ShowToastCmd.did(output) && PlaySoundCmd.did(output)
}

export const ShowWarningSmall = {
  init,
  did,
}
