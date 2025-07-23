import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { ParentScreenProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'
import { ScreenLayoutGameCoverArt } from '../screen-layout-game-cover-art'

export const ScreenLayoutHostSettingUpGame = (input: {
  parentScreen: ParentScreenProps | null
  navBar?: {
    title: TranslatedText
    subtitle?: TranslatedText | null
    back?: {
      onPressDown?: () => void
    }
  }
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  dataTestId?: string
  renderCoverArt?: (input: { class: string }) => VDom
}) => {
  return h(ScreenLayoutGameCoverArt, {
    id: 'host-setting-up-game',
    parentScreen: input.parentScreen,
    dataTestId: input.dataTestId,
    ctx: input.ctx,
    navBar: input.navBar,
    renderCoverArt: input.renderCoverArt,
    renderBody: () =>
      h(Typography, {
        text: input.ctx.t('game.host-is-setting-up-game'),
        variant: 'title',
        class: 'w-full px-4 text-center',
        sizeClassName: 'text-lg',
      }),
  })
}
