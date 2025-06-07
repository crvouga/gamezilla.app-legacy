import { History } from '~/@/history'
import { IconArrowRotateLeft } from '~/@/ui/icon/icon-arrow-rotate-left'
import { IconArrowRotateRight } from '~/@/ui/icon/icon-arrow-rotate-right'
import { IconExpand } from '~/@/ui/icon/icon-expand'
import { IconXMark } from '~/@/ui/icon/icon-x-mark'
import { Typography } from '~/@/ui/typography'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ScreenLayoutProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { ModeEdit } from '.'
import { GroupId } from '../numberlink/group-id'
import { BoardLayout } from '../ui/board-layout'
import { Color } from '../ui/color'
import { VariantBoard, VariantDimensions } from '../variant'

const View = (input: {
  ctx: AppFrontendCtx
  model: ModeEdit.Model
  dispatch: (m: ModeEdit.Msg) => void
  screenLayout: Partial<ScreenLayoutProps>
}) => {
  return (
    <ScreenLayout
      {...input.screenLayout}
      parentScreen={input.ctx.parentScreen}
      id='mode-edit-screen'
      ctx={input.ctx}
      renderBody={() => (
        <BoardLayout>
          <ViewStatus {...input} />

          <VariantBoard.View
            model={ModeEdit.toFlow(input.model)}
            onDraggedOver={(nodeId) => input.dispatch({ t: 'dragged-over', nodeId })}
            onPressDown={(nodeId) => input.dispatch({ t: 'pressed-down-node', nodeId })}
            onPressUp={(nodeId) => input.dispatch({ t: 'pressed-up-node', nodeId })}
          />
        </BoardLayout>
      )}
      actionBar={{
        variant: {
          t: 'uniform',
          actions: [
            {
              id: input.ctx.t('app.undo'),
              icon: (input) => <IconArrowRotateLeft {...input} />,
              label: input.ctx.t('app.undo'),
              onClick: () => input.dispatch({ t: 'clicked-undo' }),
              disabled: !History.canUndo(input.model.form),
            },
            {
              id: input.ctx.t('app.redo'),
              icon: (input) => <IconArrowRotateRight {...input} />,
              label: input.ctx.t('app.redo'),
              disabled: !History.canRedo(input.model.form),
              onClick: () => input.dispatch({ t: 'clicked-redo' }),
            },
            {
              id: input.ctx.t('app.clear'),
              icon: (input) => <IconXMark {...input} />,
              label: input.ctx.t('app.clear'),
              disabled: !ModeEdit.canClear(input.model),
              onClick: () => input.dispatch({ t: 'clicked-clear' }),
            },
            {
              id: input.ctx.t('app.dimensions'),
              icon: (input) => <IconExpand {...input} />,
              label: input.ctx.t('app.dimensions'),
              onClick: () => input.dispatch({ t: 'dimensions-form.clicked-open' }),
              renderSurface: ({ dropDown }) => (
                <SurfaceLayout
                  id='dimensions'
                  ctx={input.ctx}
                  ariaLabel={input.ctx.t('app.dimensions')}
                  open={input.model.opened?.t === 'dimensions'}
                  onClose={() => input.dispatch({ t: 'dimensions-form.closed' })}
                  dropDown={{
                    ...dropDown,
                    position: 'start',
                    alignment: 'ending',
                  }}
                  header={{
                    render: () => (
                      <SurfaceHeader
                        ctx={input.ctx}
                        title={input.ctx.t('app.dimensions')}
                        onClose={() => input.dispatch({ t: 'dimensions-form.closed' })}
                      />
                    ),
                  }}
                  form={{
                    onSubmit: () => input.dispatch({ t: 'dimensions-form.clicked-save' }),
                    onCancel: () => input.dispatch({ t: 'dimensions-form.clicked-cancel' }),
                    cancelDisabled: false,
                    cancelText: input.ctx.t('app.cancel'),
                    submitText: input.ctx.t('app.apply'),
                    submitLoading: false,
                    submitDisabled: !ModeEdit.canSubmitDimensionsForm(input.model),
                  }}
                  body={{
                    render: () =>
                      input.model.opened?.draftDimensions && (
                        <VariantDimensions.ViewForm
                          ctx={input.ctx}
                          form={input.model.opened?.draftDimensions}
                          onInput={(dimensions) => input.dispatch({ t: 'dimensions-form.inputted', dimensions })}
                        />
                      ),
                  }}
                />
              ),
            },
          ],
        },
      }}
    />
  )
}

const ViewStatus: typeof View = (input) => {
  const position = ModeEdit.toCurrentPlacingTerminalPosition(input.model) === 'start' ? 'first' : 'last'
  return (
    <div className='flex w-full items-center justify-center gap-1 p-2'>
      <Typography variant='body' text={input.ctx.t('flow.placing', { position })} />
      <ViewTerminal groupId={ModeEdit.toCurrentPlacingGroupId(input.model)} className='size-6' />
    </div>
  )
}

const ViewTerminal = ({ groupId, className }: { className: string; groupId: GroupId }) => {
  const color = Color.groupIdToHex(groupId)
  return (
    <svg className={className} viewBox='-1 -1 2 2'>
      <circle cx='0' cy='0' r='0.8' fill={color} />
    </svg>
  )
}

export const ModeEditFrontend = {
  View,
}
