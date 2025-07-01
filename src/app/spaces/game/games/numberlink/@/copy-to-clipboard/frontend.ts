import { s } from '~/@/schema'
import { IconCopy } from '~/@/ui/icon'
import { v } from '~/@/vdom/v'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { CopyToClipboardCmd } from '~/app/@/frontend/copy-to-clipboard-cmd.$msg'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { NumberlinkVariant } from '../variant'
import { VariantGridShorthand } from '../variant/grid'

export const MsgFrontend = s.or(
  s.obj({
    t: s.l('user-clicked-copy-to-clipboard'),
  }),
  s.obj({
    t: s.l('copied-to-clipboard'),
  }),
)
export type MsgFrontend = s.Infer<typeof MsgFrontend>

const update = <TModel>(input: {
  msg: MsgFrontend | { t: string & {} }
  model: TModel
  ctx: AppFrontendCtx
  numberlink: NumberlinkVariant.Model
}): {
  model: TModel
  msgOut?: unknown[]
} => {
  switch (input.msg?.t) {
    case 'user-clicked-copy-to-clipboard': {
      if (input.numberlink.t !== 'grid') {
        return {
          model: input.model,
        }
      }

      const shorthand = VariantGridShorthand.fromGrid(input.numberlink)

      const encoded = JSON.stringify(shorthand)

      return {
        model: input.model,
        msgOut: [
          PlaySoundCmd.init(APP_SOUND.refreshFeed),
          ShowToastCmd.init(input.ctx.t('app.copied-to-clipboard')),
          CopyToClipboardCmd.init(encoded),
        ],
      }
    }
  }
  return {
    model: input.model,
  }
}

const viewAction = ({ ctx, dispatch }: { ctx: AppFrontendCtx; dispatch: (m: MsgFrontend) => void }): ScreenAction[] => {
  return [
    {
      id: ctx.t('game.numberlink.copy-puzzle-to-clipboard'),
      icon: (input) => v(IconCopy, input),
      label: ctx.t('game.numberlink.copy-puzzle-to-clipboard'),
      onClick: () =>
        dispatch({
          t: 'user-clicked-copy-to-clipboard',
        }),
    },
  ]
}

export const CopyToClipboardFrontend = {
  update,
  viewAction,
}
