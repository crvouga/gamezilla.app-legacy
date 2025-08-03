import { History } from '~/@/history'
import { IconArrowRotateLeft, IconArrowRotateRight, IconExpand, IconXMark } from '~/@/ui/icon'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Circle } from '~/@/vdom/primitives/svg/circle'
import { Svg } from '~/@/vdom/primitives/svg/svg'
import { VDom } from '~/@/vdom/vdom'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ScreenLayoutProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { ModeEdit } from '.'
import { GroupId } from '../numberlink/group-id'
import { BoardLayout } from '../ui/board-layout'
import { BorderImpl } from '../ui/border-impl'
import { Color } from '../ui/color'
import { NumberlinkVariantBoard } from '../variant'
import { VariantDimensions } from '../variant/variant-dimensions'

const View = (input: {
  ctx: AppFrontendCtx
  model: ModeEdit.Model
  dispatch: (m: ModeEdit.Msg) => void
  screenLayout: Partial<ScreenLayoutProps>
}): VDom => {
  return h(ScreenLayout, {
    ...input.screenLayout,
    parentScreen: input.ctx.parentScreen,
    id: 'mode-edit-screen',
    ctx: input.ctx,
    renderBody: () =>
      h(BoardLayout, {}, [
        h(ViewStatus, input),

        h(NumberlinkVariantBoard.View, {
          impl: BorderImpl.fromPlatform(input.ctx.platform),
          platform: input.ctx.platform,
          model: ModeEdit.toNumberlink(input.model),
          onDraggedOver: (nodeId) => input.dispatch({ t: 'dragged-over', nodeId }),
          onPressDown: (nodeId) => input.dispatch({ t: 'pressed-down-node', nodeId }),
          onPressUp: (nodeId) => input.dispatch({ t: 'pressed-up-node', nodeId }),
        }),
      ]),
    actionBar: {
      variant: {
        t: 'uniform',
        actions: [
          {
            id: input.ctx.t('app.undo'),
            renderIcon: (input) => h(IconArrowRotateLeft, input),
            label: input.ctx.t('app.undo'),
            onPress: () => input.dispatch({ t: 'clicked-undo' }),
            disabled: !History.canUndo(input.model.form),
          },
          {
            id: input.ctx.t('app.redo'),
            renderIcon: (input) => h(IconArrowRotateRight, input),
            label: input.ctx.t('app.redo'),
            disabled: !History.canRedo(input.model.form),
            onPress: () => input.dispatch({ t: 'clicked-redo' }),
          },
          {
            id: input.ctx.t('app.clear'),
            renderIcon: (input) => h(IconXMark, input),
            label: input.ctx.t('app.clear'),
            disabled: !ModeEdit.canClear(input.model),
            onPress: () => input.dispatch({ t: 'clicked-clear' }),
          },
          {
            id: input.ctx.t('app.dimensions'),
            renderIcon: (input) => h(IconExpand, input),
            label: input.ctx.t('app.dimensions'),
            onPress: () => input.dispatch({ t: 'dimensions-form.clicked-open' }),
            renderSurface: ({ dropDown }) =>
              h(SurfaceLayout, {
                id: 'dimensions',
                ctx: input.ctx,
                ariaLabel: input.ctx.t('app.dimensions'),
                open: input.model.opened?.t === 'dimensions',
                onClose: () => input.dispatch({ t: 'dimensions-form.closed' }),
                dropDown: {
                  ...dropDown,
                  position: 'start',
                  alignment: 'ending',
                },
                header: {
                  render: () =>
                    h(SurfaceHeader, {
                      ctx: input.ctx,
                      title: input.ctx.t('app.dimensions'),
                      onClose: () => input.dispatch({ t: 'dimensions-form.closed' }),
                    }),
                },
                form: {
                  onSubmit: () => input.dispatch({ t: 'dimensions-form.clicked-save' }),
                  onCancel: () => input.dispatch({ t: 'dimensions-form.clicked-cancel' }),
                  cancelDisabled: false,
                  cancelText: input.ctx.t('app.cancel'),
                  submitText: input.ctx.t('app.apply'),
                  submitLoading: false,
                  submitDisabled: !ModeEdit.canSubmitDimensionsForm(input.model),
                },
                body: {
                  render: () =>
                    input.model.opened?.draftDimensions &&
                    h(VariantDimensions.ViewForm, {
                      ctx: input.ctx,
                      form: input.model.opened?.draftDimensions,
                      onInput: (dimensions) => input.dispatch({ t: 'dimensions-form.inputted', dimensions }),
                    }),
                },
              }),
          },
        ],
      },
    },
  })
}

const ViewStatus: typeof View = (input) => {
  const position = ModeEdit.toCurrentPlacingTerminalPosition(input.model) === 'start' ? 'first' : 'last'
  return h(
    Box,
    {
      style: theme({
        flexDirection: 'row',
        width: 'full',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        padding: 2,
      }),
    },
    [
      h(Typography, {
        variant: 'body',
        text: input.ctx.t('game.numberlink.placing', { position }),
      }),
      h(ViewTerminal, {
        groupId: ModeEdit.toCurrentPlacingGroupId(input.model),
        style: theme({ size: 6 }),
      }),
    ],
  )
}

const ViewTerminal = ({ groupId, style }: { style: Record<string, unknown>; groupId: GroupId }) => {
  const color = Color.groupIdToHex(groupId)
  return h(Svg, { style, viewBox: '-1 -1 2 2' }, [h(Circle, { cx: '0', cy: '0', r: '0.8', fill: color })])
}

export const ModeEditFrontend = {
  View,
}
