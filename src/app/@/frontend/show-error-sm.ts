import { TranslatedText } from '~/@/l18n'

import { TimeSpan } from '~/@/time/time-span'
import { APP_SOUND } from './cmd'
import { PlaySoundCmd } from './play-sound-cmd'
import { ShowToastCmd } from './show-toast-cmd'

export const init = (text: TranslatedText, errorMsg?: string, duration?: TimeSpan): unknown[] => {
  return [
    ShowToastCmd.init(text, {
      variant: 'error',
      duration,
      errorMsg,
    }),
    PlaySoundCmd.init(APP_SOUND.alertErrorSm),
  ]
}
export const ShowErrorSmall = {
  init,
}
