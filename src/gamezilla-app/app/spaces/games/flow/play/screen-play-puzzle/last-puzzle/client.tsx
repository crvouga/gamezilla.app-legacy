import { TimeSpan } from 'gamezilla-app/@/core'
import { APP_SOUND, playSound, type AppClientCtx } from 'gamezilla-app/app/@/client'
import { Button, Dialog, DialogHeader, DialogSurface } from 'gamezilla-app/app/@/ui'
import type { ClientModule, MsgClient } from '../../types'

const update: ClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'user-closed-puzzle-complete-dialog': {
      return {
        model: input.model
      }
    }
    case 'user-clicked-select-next-pack': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)]
      }
    }
  }
  return {
    model: input.model
  }
}

const View = (input: { open: boolean; delay: TimeSpan; dispatch: (m: MsgClient) => void; ctx: AppClientCtx }) => {
  return (
    <Dialog
      delay={TimeSpan.seconds(1)}
      open={input.open}
      onClose={() =>
        input.dispatch({
          t: 'got-msg-core',
          c: {
            t: 'user-closed-puzzle-complete-dialog'
          }
        })
      }
    >
      <DialogSurface>
        <DialogHeader title={input.ctx.t('app.congratulations')} />

        <Button
          text={input.ctx.t('flow.select-next-pack')}
          onClick={() =>
            input.dispatch({
              t: 'got-msg-core',
              c: {
                t: 'user-clicked-select-next-pack'
              }
            })
          }
        />
      </DialogSurface>
    </Dialog>
  )
}

export const LastPuzzleClient = {
  View,
  update
}
