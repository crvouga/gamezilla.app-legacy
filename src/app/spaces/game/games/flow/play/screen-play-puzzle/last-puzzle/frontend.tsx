import { TimeSpan } from '~/@/time/time-span'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { type AppFrontendCtx } from '~/app/@/frontend/ctx'
import { Button, Dialog, DialogHeader, DialogSurface } from '~/app/@/ui'
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
          c: {
            t: 'user-closed-puzzle-complete-dialog',
          },
        })
      }
    >
      <DialogSurface>
        <DialogHeader title={input.ctx.t('app.congratulations')} />

        <Button
          text={input.ctx.t('flow.select-next-pack')}
          onClick={() =>
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'user-clicked-select-next-pack',
              },
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
