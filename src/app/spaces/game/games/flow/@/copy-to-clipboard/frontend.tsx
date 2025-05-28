import { p } from '~/@/parser'
import { IconCopy } from '~/@/ui/icon/icon-copy'
import { APP_SOUND } from '~/app/@/frontend/cmd'
import { CopyToClipboardCmd } from '~/app/@/frontend/copy-to-clipboard-cmd'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { Variant } from '../variant'
import { VariantGridShorthand } from '../variant/grid'

export const MsgFrontend = p.or(
  p.obj({
    t: p.l('user-clicked-copy-to-clipboard'),
  }),
  p.obj({
    t: p.l('copied-to-clipboard'),
  }),
)
export type MsgFrontend = p.Infer<typeof MsgFrontend>

const update = <TModel,>(input: {
  msg: MsgFrontend | { t: string & {} }
  model: TModel
  ctx: AppFrontendCtx
  flow: Variant.Model
}): {
  model: TModel
  msgOut?: unknown[]
} => {
  switch (input.msg?.t) {
    case 'user-clicked-copy-to-clipboard': {
      if (input.flow.t !== 'flow-grid') {
        return {
          model: input.model,
        }
      }

      const shorthand = VariantGridShorthand.fromGrid(input.flow)

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
      id: ctx.t('flow.copy-puzzle-to-clipboard'),
      icon: (input) => <IconCopy {...input} />,
      label: ctx.t('flow.copy-puzzle-to-clipboard'),
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
