import { Button } from '~/@/ui/button'
import { Dialog } from '~/@/ui/surface-dialog/dialog'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { SurfaceActions } from '~/@/ui/surface/surface-actions'
import { SurfaceBody } from '~/@/ui/surface/surface-body'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { type AppFrontendCtx } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { PrebuiltActions } from '../../../../@/ui/prebuilt-actions'
import type { FrontendModule, MsgFrontend } from '../../types'
import { ScreenPlayPuzzleSpace } from '../space'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-closed-puzzle-complete-dialog': {
      return {
        model: input.model,
      }
    }
    case 'user-clicked-select-next-pack': {
      return {
        model: input.model,
        msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)],
      }
    }
  }
  return {
    model: input.model,
  }
}

const ViewDialog = (input: { open: boolean; dispatch: (m: MsgFrontend) => void; ctx: AppFrontendCtx }) => {
  const onClose = () => {
    input.dispatch({
      t: 'got-msg-space',
      c: { t: 'user-closed-puzzle-complete-dialog', userId: input.ctx.currentUser.userId },
    })
  }

  return h(Dialog, { delay: '300ms', open: input.open, onClose }, [
    h(DialogSurface, {}, [
      h(SurfaceHeader, { ctx: input.ctx, title: input.ctx.t('app.congratulations'), onClose }),

      h(SurfaceBody, {}, [h(Typography, { text: input.ctx.t('game.numberlink.you-have-completed-the-pack') })]),

      h(SurfaceActions, {}, [
        h(Button, {
          style: theme({ width: 'full' }),
          text: input.ctx.t('game.numberlink.select-next-pack'),
          onPress: () =>
            input.dispatch({
              t: 'got-msg-space',
              c: { t: 'user-clicked-select-next-pack', userId: input.ctx.currentUser.userId },
            }),
        }),
      ]),
    ]),
  ])
}

const TEST_ID_LAST_PUZZLE_SELECT_NEXT_ID = 'last-puzzle-select-next-pack'

const viewActions = (input: Parameters<FrontendModule['View']>[0]): ScreenAction[] => {
  if (input.modelSpace.screen.t !== 'screen-play-puzzle') return []
  const isSolved = ScreenPlayPuzzleSpace.isSolved(input.modelSpace.screen)
  if (!isSolved) return []
  const isLastPuzzle = ScreenPlayPuzzleSpace.isLastPuzzle(input.modelSpace.screen)
  if (!isLastPuzzle) return []
  return [
    PrebuiltActions.next({
      ctx: input.ctx,
      label: input.ctx.t('game.numberlink.next-pack'),
      color: 'success',
      onPress: () => {
        input.dispatch({
          t: 'got-msg-space',
          c: { t: 'user-clicked-select-next-pack', userId: input.ctx.currentUser.userId },
        })
      },
      testId: TEST_ID_LAST_PUZZLE_SELECT_NEXT_ID,
      id: TEST_ID_LAST_PUZZLE_SELECT_NEXT_ID,
    }),
  ]
}

export const LastPuzzleFrontend = {
  ViewDialog,
  viewActions,
  TEST_ID_LAST_PUZZLE_SELECT_NEXT_ID,
  update,
}
