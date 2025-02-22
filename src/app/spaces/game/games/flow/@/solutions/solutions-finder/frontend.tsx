import { Button, Dialog, IconLightbulb } from '~/@/ui'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { SurfaceActions } from '~/@/ui/surface/surface-actions'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { SolutionHash } from '../solution-hash/solution-hash'
import { initFrontend, type FrontendModule, type MsgFrontend, type MsgInCmdFrontend } from './types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgCmd?.t) {
    case 'flow-cmd.got-solutions-finder-cmd': {
      return update({ ...input, msgCmd: null, msg: input.msgCmd.c.msg })
    }
  }

  switch (input.msg?.t) {
    case 'dialog.clicked-open': {
      return {
        model: { ...input.model, open: 'find-solutions-confirmation' },
        msgCmd: [playSound(APP_SOUND.surfaceOpened)],
      }
    }
    case 'dialog.clicked-close': {
      return {
        model: { ...input.model, open: null },
        msgCmd: [playSound(APP_SOUND.surfaceClosed)],
      }
    }
  }
  return { model: input.model }
}

const ViewSurface: FrontendModule['View'] = (input) => {
  const onClose = () => input.dispatch({ t: 'dialog.clicked-close' })
  return (
    <Dialog open={input.model.open === 'find-solutions-confirmation'} onClose={onClose}>
      <DialogSurface>
        <SurfaceHeader ctx={input.ctx} title={input.ctx.t('app.congratulations')} onClose={onClose} />

        {/* <SurfaceBody>
          <Typography text={input.ctx.t('flow.you-have-completed-the-pack')} />
        </SurfaceBody> */}

        <SurfaceActions>
          <Button className='flex-1' text={input.ctx.t('app.cancel')} onClick={onClose} />
          <Button
            className='flex-1'
            text={input.ctx.t('flow.select-next-pack')}
            onClick={() => {
              if (!input.ctx.flow) return
              const hash = SolutionHash.init(input.ctx.flow)
              input.dispatch({ t: 'clicked-find-solutions', hash })
            }}
          />
        </SurfaceActions>
      </DialogSurface>
    </Dialog>
  )
}

const viewAction = (input: Parameters<FrontendModule['View']>[0]): ScreenAction[] => {
  return [
    {
      icon: (input) => <IconLightbulb {...input} />,
      label: input.ctx.t('flow.find-solutions'),
      onClick: () => input.dispatch({ t: 'dialog.clicked-open' }),
      renderSurface: (vDom) => (
        <>
          {vDom}
          input.model.open={String(input.model.open)}
          <ViewSurface {...input} />
        </>
      ),
    },
  ]
}

const gotMsg = (msg: MsgFrontend): MsgInCmdFrontend => {
  return {
    t: 'flow-cmd.got-solutions-finder-cmd',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

export const SolutionsFinderFrontend = {
  init: initFrontend,
  update,
  ViewDialog: ViewSurface,
  viewAction,
  gotMsg,
}
