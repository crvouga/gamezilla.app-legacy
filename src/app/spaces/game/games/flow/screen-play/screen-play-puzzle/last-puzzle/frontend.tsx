import { TimeSpan } from '~/@/time/time-span'
import { Button, Dialog, IconChevronRight, Typography } from '~/@/ui'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { SurfaceActions } from '~/@/ui/surface/surface-actions'
import { SurfaceBody } from '~/@/ui/surface/surface-body'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { type AppFrontendCtx } from '~/app/@/frontend/ctx'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
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
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }
  }
  return {
    model: input.model,
  }
}

const ViewDialog = (input: {
  open: boolean
  delay: TimeSpan
  dispatch: (m: MsgFrontend) => void
  ctx: AppFrontendCtx
}) => {
  const onClose = () => {
    input.dispatch({
      t: 'got-msg-space',
      c: { t: 'user-closed-puzzle-complete-dialog', userId: input.ctx.currentUser.userId },
    })
  }

  return (
    <Dialog delay={TimeSpan.seconds(1)} open={input.open} onClose={onClose}>
      <DialogSurface>
        <SurfaceHeader ctx={input.ctx} title={input.ctx.t('app.congratulations')} onClose={onClose} />

        <SurfaceBody>
          <Typography text={input.ctx.t('flow.you-have-completed-the-pack')} />
        </SurfaceBody>

        <SurfaceActions>
          <Button
            className='w-full'
            text={input.ctx.t('flow.select-next-pack')}
            onClick={() =>
              input.dispatch({
                t: 'got-msg-space',
                c: { t: 'user-clicked-select-next-pack', userId: input.ctx.currentUser.userId },
              })
            }
          />
        </SurfaceActions>
      </DialogSurface>
    </Dialog>
  )
}

const TEST_ID = 'last-puzzle-select-next-pack'

const isActionExit = (action: ScreenAction): boolean => {
  return action.testId === TEST_ID
}

const viewActions = (input: Parameters<FrontendModule['View']>[0]): ScreenAction[] => {
  if (input.modelSpace.screen.t !== 'screen-play-puzzle') return []
  const isSolved = ScreenPlayPuzzleSpace.isSolved(input.modelSpace.screen)
  if (!isSolved) return []
  const isLastPuzzle = ScreenPlayPuzzleSpace.isLastPuzzle(input.modelSpace.screen)
  if (!isLastPuzzle) return []
  return [
    {
      icon: (input) => <IconChevronRight {...input} />,
      label: input.ctx.t('flow.select-next-pack'),
      onClick: () => {
        input.dispatch({
          t: 'got-msg-space',
          c: { t: 'user-clicked-select-next-pack', userId: input.ctx.currentUser.userId },
        })
      },
      testId: TEST_ID,
      id: TEST_ID,
    },
  ]
}

export const LastPuzzleFrontend = {
  ViewDialog,
  viewActions,
  isActionExit,
  update,
}
