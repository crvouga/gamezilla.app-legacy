import { Json } from '~/@/json/json'
import { isErr } from '~/@/result'
import { IconCopy } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { CopyToClipboardCmd } from '~/app/@/frontend/copy-to-clipboard-cmd.$msg'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ShowErrorSmall } from '~/app/@/frontend/show-error-small'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ModePlay } from '../../../@/mode-play'
import { SolutionHash } from '../../../@/solutions/solution-hash/solution-hash'
import { SolutionsDbQueryCache } from '../../../@/solutions/solutions-db-query-cache'
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
          ctx: ModePlay.initCtx({
            numberlink: input.modelSpace.screen.puzzleResult.c.model,
            solutions: SolutionsDbQueryCache.read(
              input.ctx,
              SolutionHash.init(input.modelSpace.screen.puzzleResult.c.model),
            ),
          }),
        })

      const numberlink = ModePlay.toNumberlink(modePlay, input.modelSpace.screen.puzzleResult.c.model)

      if (numberlink.t !== 'grid') {
        return {
          model: input.model,
        }
      }

      const shorthand = VariantGridShorthand.fromGrid(numberlink)

      const encoded = Json.stringify(shorthand)

      if (isErr(encoded)) {
        return {
          model: input.model,
          msgOut: [...ShowErrorSmall.init(input.ctx.t('app.something-went-wrong'))],
        }
      }

      return {
        model: input.model,
        msgOut: [
          PlaySoundCmd.init(APP_SOUND.refreshFeed),
          ShowToastCmd.init(input.ctx.t('app.copied-to-clipboard')),
          CopyToClipboardCmd.init(encoded.value),
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
  if (ctx.currentUser.role !== 'super') return null

  return {
    id: ctx.t('app.copy'),
    icon: (input) => h(IconCopy, input),
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
