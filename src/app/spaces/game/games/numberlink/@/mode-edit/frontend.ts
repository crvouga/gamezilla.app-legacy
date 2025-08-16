import { History } from '~/@/history'
import { IconArrowRotateLeft, IconArrowRotateRight, IconExpand, IconXMark } from '~/@/ui/icon'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { sx } from '~/@/vdom/style/sx'
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

const View = (props: {
  ctx: AppFrontendCtx
  model: ModeEdit.Model
  dispatch: (m: ModeEdit.Msg) => void
  screenLayout: Partial<ScreenLayoutProps>
}): VDom => {
  return h(ScreenLayout, {
    ...props.screenLayout,
    parentScreen: props.ctx.parentScreen,
    id: 'mode-edit-screen',
    ctx: props.ctx,
    renderBody: () =>
      h(BoardLayout, {}, [
        h(ViewStatus, props),

        h(NumberlinkVariantBoard.View, {
          impl: BorderImpl.fromPlatform(props.ctx.platform),
          platform: props.ctx.platform,
          model: ModeEdit.toNumberlink(props.model),
          onDraggedOver: (nodeId) => props.dispatch({ t: 'dragged-over', nodeId }),
          onPressDown: (nodeId) => props.dispatch({ t: 'pressed-down-node', nodeId }),
          onPressUp: (nodeId) => props.dispatch({ t: 'pressed-up-node', nodeId }),
        }),
      ]),
    actionBar: {
      variant: {
        t: 'uniform',
        actions: [
          {
            id: props.ctx.t('app.undo'),
            renderIcon: (input) => h(IconArrowRotateLeft, input),
            label: props.ctx.t('app.undo'),
            onPress: () => props.dispatch({ t: 'clicked-undo' }),
            disabled: !History.canUndo(props.model.form),
          },
          {
            id: props.ctx.t('app.redo'),
            renderIcon: (input) => h(IconArrowRotateRight, input),
            label: props.ctx.t('app.redo'),
            disabled: !History.canRedo(props.model.form),
            onPress: () => props.dispatch({ t: 'clicked-redo' }),
          },
          {
            id: props.ctx.t('app.clear'),
            renderIcon: (iconProps) => h(IconXMark, iconProps),
            label: props.ctx.t('app.clear'),
            disabled: !ModeEdit.canClear(props.model),
            onPress: () => {
              props.dispatch({ t: 'clicked-clear' })
            },
          },
          {
            id: props.ctx.t('app.dimensions'),
            renderIcon: (iconProps) => h(IconExpand, iconProps),
            label: props.ctx.t('app.dimensions'),
            onPress: () => {
              props.dispatch({ t: 'dimensions-form.clicked-open' })
            },
            renderSurface: ({ dropDown }) =>
              h(SurfaceLayout, {
                id: 'dimensions',
                ctx: props.ctx,
                ariaLabel: props.ctx.t('app.dimensions'),
                open: props.model.opened?.t === 'dimensions',
                onClose: () => {
                  props.dispatch({ t: 'dimensions-form.closed' })
                },
                dropDown: {
                  ...dropDown,
                  position: 'start',
                  alignment: 'ending',
                },
                header: {
                  render: () =>
                    h(SurfaceHeader, {
                      ctx: props.ctx,
                      title: props.ctx.t('app.dimensions'),
                      onClose: () => {
                        props.dispatch({ t: 'dimensions-form.closed' })
                      },
                    }),
                },
                form: {
                  onSubmit: () => {
                    props.dispatch({ t: 'dimensions-form.clicked-save' })
                  },
                  onCancel: () => {
                    props.dispatch({ t: 'dimensions-form.clicked-cancel' })
                  },
                  cancelDisabled: false,
                  cancelText: props.ctx.t('app.cancel'),
                  submitText: props.ctx.t('app.apply'),
                  submitLoading: false,
                  submitDisabled: !ModeEdit.canSubmitDimensionsForm(props.model),
                },
                body: {
                  render: () => {
                    const form = props.model.opened?.draftDimensions
                    if (!form) return null
                    return h(Box, { style: sx({ width: 'full', maxWidth: 'xl' }) }, [
                      h(VariantDimensions.ViewForm, {
                        ctx: props.ctx,
                        form,
                        onInput: (dimensions) => props.dispatch({ t: 'dimensions-form.inputted', dimensions }),
                      }),
                    ])
                  },
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
      style: sx({
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
        style: sx({ size: 6 }),
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
