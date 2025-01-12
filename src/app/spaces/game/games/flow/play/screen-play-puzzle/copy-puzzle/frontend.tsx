import { APP_SOUND, copyToClipboard, playSound, showToast } from '~/app/@/frontend/cmd'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { IconCopy } from '~/app/@/ui'
import type { BottomButtonInput } from '~/app/@/ui/bottom-buttons'
import { PlayMode } from '../../../@/play-mode'
import { VariantGridShorthand } from '../../../@/variant/grid'
import type { FrontendModule, MsgFrontend } from '../../types'

export const update: FrontendModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'user-clicked-copy-to-clipboard': {
      if (input.modelCore.screen.t !== 'screen-play-puzzle') {
        return {
          model: input.model,
        }
      }

      if (input.modelCore.screen.puzzleResult.t === 'not-found') {
        return {
          model: input.model,
        }
      }

      const playMode =
        input.modelCore.screen.playMode ??
        PlayMode.init({
          ctx: PlayMode.initCtx({
            flow: input.modelCore.screen.puzzleResult.c.flow,
            solutions: input.ctx.solutions,
          }),
        })

      const flow = PlayMode.toFlow({
        flow: input.modelCore.screen.puzzleResult.c.flow,
        model: playMode,
      })

      if (flow.t !== 'flow-grid') {
        return {
          model: input.model,
        }
      }

      const shorthand = VariantGridShorthand.fromGrid(flow)

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

export const viewButtonAction = ({
  ctx,
  dispatch,
}: {
  ctx: AppFrontendCtx
  dispatch: (m: MsgFrontend) => void
}): BottomButtonInput | null => {
  if (ctx.currentUserRole !== 'super') {
    return null
  }
  return {
    icon: (input) => <IconCopy {...input} />,
    label: ctx.t('app.copy'),
    onClick: () =>
      dispatch({
        t: 'got-msg-core',
        c: {
          t: 'user-clicked-copy-to-clipboard',
        },
      }),
  }
}
