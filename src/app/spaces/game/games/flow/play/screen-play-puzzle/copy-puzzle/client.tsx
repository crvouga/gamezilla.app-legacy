import { APP_SOUND, copyToClipboard, playSound, showToast } from '~/app/@/client/cmd'
import { AppClientCtx } from '~/app/@/client/ctx'
import { IconCopy } from '~/app/@/ui'
import type { BottomButtonInput } from '~/app/@/ui/bottom-buttons'
import { Play } from '../../../@/play'
import { VariantGridShorthand } from '../../../@/variant/grid'
import type { ClientModule, MsgClient } from '../../types'

export const update: ClientModule['update'] = (input) => {
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

      const flowPlay =
        input.modelCore.screen.flowPlay ??
        Play.init({
          ctx: Play.initCtx({
            flowPuzzle: input.modelCore.screen.puzzleResult.c,
          }),
        })

      const flow = Play.toFlow({
        flow: input.modelCore.screen.puzzleResult.c.flow,
        model: flowPlay,
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
  ctx: AppClientCtx
  dispatch: (m: MsgClient) => void
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
