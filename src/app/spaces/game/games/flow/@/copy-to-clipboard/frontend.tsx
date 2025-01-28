import { p } from '~/@/parser'
import { APP_SOUND, AppFrontendCmd, copyToClipboard, playSound, showToast } from '~/app/@/frontend/cmd'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { IconCopy } from '~/@/ui'
import { ScreenAction } from '~/app/@/ui/screen-layout/screen-action-bar/props'
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
  msgCmd?: AppFrontendCmd<never>[]
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
        msgCmd: [
          playSound(APP_SOUND.refreshFeed),
          showToast(input.ctx.t('app.copied-to-clipboard')),
          copyToClipboard(encoded),
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
