import { Button, Dialog, IconLightbulb } from '~/@/ui'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { SurfaceActions } from '~/@/ui/surface/surface-actions'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { SolutionHash } from '../solution-hash/solution-hash'
import type { FrontendModule } from './types'

const update: FrontendModule['update'] = (input) => {
  return { model: input.model }
}

const ViewDialog = (
  input: Parameters<FrontendModule['View']>[0] & {
    solutionHash: SolutionHash
  },
) => {
  const open = false
  const onClose = () => {}
  return (
    <Dialog open={open} onClose={onClose}>
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
            onClick={() => input.dispatch({ t: 'clicked-find-solutions', hash: input.solutionHash })}
          />
        </SurfaceActions>
      </DialogSurface>
    </Dialog>
  )
}

const viewHintAction = (input: Parameters<FrontendModule['View']>[0]): ScreenAction[] => {
  return [
    {
      icon: (input) => <IconLightbulb {...input} />,
      label: input.ctx.t('game.hint'),
      onClick: () => input.dispatch({ t: 'dialog.clicked-open' }),
    },
  ]
}

export const SolutionsFinderFrontend = {
  update,
  ViewDialog,
  viewHintAction,
}
