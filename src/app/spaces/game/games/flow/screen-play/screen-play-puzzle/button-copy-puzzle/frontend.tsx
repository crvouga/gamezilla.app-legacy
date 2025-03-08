import { Json } from '~/@/json/json'
import { isErr } from '~/@/result'
import { APP_SOUND, copyToClipboard, playSound, showErrSm, showToast } from '~/app/@/frontend/cmd'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { IconCopy } from '~/@/ui'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ModePlay } from '../../../@/mode-play'
import { VariantGridShorthand } from '../../../@/variant/grid'
import type { FrontendModule, MsgFrontend } from '../../types'

export const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-clicked-copy-to-clipboard': {
      if (input.modelSpace.screen.t !== 'screen-play-puzzle') {
        return {
          model: input.model,
        }
      }

      if (input.modelSpace.screen.puzzleResult.t === 'not-found') {
        return {
          model: input.model,
        }
      }

      const modePlay =
        input.modelSpace.screen.modePlay ??
        ModePlay.init({
          ctx: ModePlay.initCtx({ flow: input.modelSpace.screen.puzzleResult.c.flow, solutions: input.ctx.solutions }),
        })

      const flow = ModePlay.toFlow(modePlay, input.modelSpace.screen.puzzleResult.c.flow)

      if (flow.t !== 'flow-grid') {
        return {
          model: input.model,
        }
      }

      const shorthand = VariantGridShorthand.fromGrid(flow)

      const encoded = Json.stringify(shorthand)

      if (isErr(encoded)) {
        return {
          model: input.model,
          msgCmd: showErrSm(input.ctx.t('app.something-went-wrong')),
        }
      }

      return {
        model: input.model,
        msgCmd: [
          playSound(APP_SOUND.refreshFeed),
          showToast(input.ctx.t('app.copied-to-clipboard')),
          copyToClipboard(encoded.value),
        ],
      }
    }
  }
  return {
    model: input.model,
  }
}

export const viewButtonAction = ({
  ctx,
  dispatch,
}: {
  ctx: AppFrontendCtx
  dispatch: (m: MsgFrontend) => void
}): ScreenAction | null => {
  if (ctx.currentUserRole !== 'super') return null

  return {
    key: ctx.t('app.copy'),
    icon: (input) => <IconCopy {...input} />,
    label: ctx.t('app.copy'),
    onClick: () =>
      dispatch({
        t: 'got-msg-space',
        c: {
          t: 'user-clicked-copy-to-clipboard',
        },
      }),
  }
}
