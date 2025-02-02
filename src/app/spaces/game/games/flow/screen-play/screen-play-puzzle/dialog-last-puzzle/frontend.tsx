import { TimeSpan } from '~/@/time/time-span'
import { Button, Dialog } from '~/@/ui'
import { DialogHeader } from '~/@/ui/dialog/dialog-header'
import { DialogSurface } from '~/@/ui/dialog/dialog-surface'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { type AppFrontendCtx } from '~/app/@/frontend/ctx'
import type { FrontendModule, MsgFrontend } from '../../types'

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

const View = (input: { open: boolean; delay: TimeSpan; dispatch: (m: MsgFrontend) => void; ctx: AppFrontendCtx }) => {
  return (
    <Dialog
      delay={TimeSpan.seconds(1)}
      open={input.open}
      onClose={() =>
        input.dispatch({
          t: 'got-msg-space',
          c: { t: 'user-closed-puzzle-complete-dialog', userId: input.ctx.currentUserId },
        })
      }
    >
      <DialogSurface>
        <DialogHeader ctx={input.ctx} title={input.ctx.t('app.congratulations')} />

        <Button
          text={input.ctx.t('flow.select-next-pack')}
          onClick={() =>
            input.dispatch({
              t: 'got-msg-space',
              c: { t: 'user-clicked-select-next-pack', userId: input.ctx.currentUserId },
            })
          }
        />
      </DialogSurface>
    </Dialog>
  )
}

export const LastPuzzleFrontend = {
  View,
  update,
}
