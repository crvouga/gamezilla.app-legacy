import { Button, Dialog, Typography } from '~/@/ui'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { SurfaceActions } from '~/@/ui/surface/surface-actions'
import { SurfaceBody } from '~/@/ui/surface/surface-body'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import type { FrontendModule } from './types'
import { SolutionHash } from '../solution-hash/solution-hash'

const update: FrontendModule['update'] = (input) => {
  return { model: input.model }
}

const ViewDialog = (
  input: Parameters<FrontendModule['View']>[0] & {
    solutionHash: SolutionHash
    open: boolean
    onClose: () => void
  },
) => {
  return (
    <Dialog open={input.open} onClose={input.onClose}>
      <DialogSurface>
        <SurfaceHeader ctx={input.ctx} title={input.ctx.t('app.congratulations')} onClose={input.onClose} />

        <SurfaceBody>
          <Typography text={input.ctx.t('flow.you-have-completed-the-pack')} />
        </SurfaceBody>

        <SurfaceActions>
          <Button className='w-full' text={input.ctx.t('app.cancel')} onClick={input.onClose} />
          <Button
            className='w-full'
            text={input.ctx.t('flow.select-next-pack')}
            onClick={() => input.dispatch({ t: 'clicked-find-solutions', hash: input.solutionHash })}
          />
        </SurfaceActions>
      </DialogSurface>
    </Dialog>
  )
}

export const SolutionsFinderFrontend = {
  update,
  ViewDialog,
}
