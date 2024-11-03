import { p } from 'gamezilla-app/@/core/parser'
import {
  APP_SOUND,
  AppClientCmd,
  copyToClipboard,
  playSound,
  showToast,
  type AppClientCtx
} from 'gamezilla-app/app/@/client'
import { IconCopy } from 'gamezilla-app/app/@/ui'
import type { ActionInput } from 'gamezilla-app/app/@/ui/actions'
import { FlowVariant } from '..'
import { FlowGridShorthand } from '../flow-variant/flow-grid'

export const MsgClient = p.or(
  p.obj({
    t: p.l('user-clicked-copy-to-clipboard')
  }),
  p.obj({
    t: p.l('copied-to-clipboard')
  })
)
export type MsgClient = p.Infer<typeof MsgClient>

const update = <TModel,>(input: {
  msg: MsgClient | { t: string & {} }
  model: TModel
  ctx: AppClientCtx
  flow: FlowVariant.Model
}): {
  model: TModel
  msgCmd?: AppClientCmd<never>[]
} => {
  switch (input.msg?.t) {
    case 'user-clicked-copy-to-clipboard': {
      if (input.flow.t !== 'flow-grid') {
        return {
          model: input.model
        }
      }

      const shorthand = FlowGridShorthand.fromGrid(input.flow)

      const encoded = JSON.stringify(shorthand)

      return {
        model: input.model,
        msgCmd: [
          playSound(APP_SOUND.refreshFeed),
          showToast(input.ctx.t('app.copied-to-clipboard')),
          copyToClipboard(encoded)
        ]
      }
    }
  }
  return {
    model: input.model
  }
}

const viewAction = ({ ctx, dispatch }: { ctx: AppClientCtx; dispatch: (m: MsgClient) => void }): ActionInput[] => {
  return [
    {
      icon: (input) => <IconCopy {...input} />,
      label: ctx.t('flow.copy-puzzle-to-clipboard'),
      onClick: () =>
        dispatch({
          t: 'user-clicked-copy-to-clipboard'
        })
    }
  ]
}

export const FlowCopyToClipboardClient = {
  update,
  viewAction
}
