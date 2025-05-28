import { TranslatedText } from '~/@/l18n'

import { TimeSpan } from '~/@/time/time-span'
import { APP_SOUND } from './cmd'
import { PlaySoundCmd } from './play-sound-cmd'
import { ShowToastCmd } from './show-toast-cmd'

export const init = (text: TranslatedText, duration?: TimeSpan): unknown[] => {
  return [
    ShowToastCmd.init(text, {
      variant: 'info',
      duration,
    }),
    PlaySoundCmd.init(APP_SOUND.refreshFeed),
  ]
}
export const ShowOkSmall = {
  init,
}
