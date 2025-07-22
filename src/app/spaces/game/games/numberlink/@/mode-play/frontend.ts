import { Translator } from '~/@/l18n/generated'
import { sleep } from '~/@/promise/sleep'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { IconCheckmark } from '~/@/ui/icon'
import { Transition } from '~/@/ui/transition/transition'
import { Box } from '~/@/vdom/box'
import { h } from '~/@/vdom/h'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { PrebuiltActions } from '../../../@/ui/prebuilt-actions'
import { Numberlink } from '../numberlink'
import { HintCalculatorFrontend } from '../solutions/hint-calculator/frontend'
import { GotHintCalculatorMsg } from '../solutions/hint-calculator/got-hint-calculator-msg.$msg'
import { SolutionHash } from '../solutions/solution-hash/solution-hash'
import { SolutionsDbQueryCache } from '../solutions/solutions-db-query-cache'
import { NumberlinkVariant, NumberlinkVariantBoard } from '../variant'
import { ModePlayFrontendCtx } from './frontend/ctx'
import { Model, Msg, toNumberlink } from './mode-play'
import { UseHint } from './use-hint'
import { UseHintFrontend } from './use-hint/frontend'

const View = (input: {
  numberlink: NumberlinkVariant.Model
  model: Model
  dispatch: (m: Msg) => void
  disabled?: boolean
  showSolvedAnimation?: boolean
}) => {
  const numberlink = toNumberlink(input.model, input.numberlink)

  return h(Box, { class: 'relative aspect-square h-full max-h-full w-full touch-none overflow-hidden select-none' }, [
    h(NumberlinkVariantBoard.View, {
      disabled: input.disabled,
      model: numberlink,
      showCoordinates: false,
      isDragging: input.model.status.t === 'dragging',
      onDraggedOver: (nodeId) => input.dispatch({ t: 'user-dragged-over-node', nodeId }),
      onPressDown: (nodeId) => input.dispatch({ t: 'user-pressed-down-node', nodeId }),
      onPressUp: (nodeId) => input.dispatch({ t: 'user-pressed-up-node', nodeId }),
      onLeave: () => input.dispatch({ t: 'user-dragging-left' }),
      autocompleteEdge:
        input.model.status.t === 'dragging' && input.model.status.autocompleteEdge
          ? { ...input.model.status.autocompleteEdge, groupId: input.model.status.activeGroupId }
          : null,
      isGroupActive: (groupId) => input.model.status.t === 'dragging' && input.model.status.activeGroupId === groupId,
      usedHints: UseHint.toUsedHints(input.model),
    }),

    h(CheckmarkAnimation, { open: Boolean(input.model.showCheckmarkAnimation && input.showSolvedAnimation) }),
  ])
}

const viewResetAction = (input: {
  numberlink: NumberlinkVariant.Model
  model: Model
  dispatch: (m: Msg) => void
  ctx: {
    t: Translator
  }
}): ScreenAction[] => {
  const numberlink = toNumberlink(input.model, input.numberlink)
  const disabled = Numberlink.isPipesEmpty(numberlink)
  return [
    PrebuiltActions.reset({
      ctx: input.ctx,
      onClick: () => input.dispatch({ t: 'user-clicked-reset' }),
      disabled,
    }),
  ]
}

const viewActions = (input: {
  model: Model
  dispatch: (m: Msg) => void
  dispatchCmd: (m: unknown) => void
  ctx: ModePlayFrontendCtx
}): ScreenAction[] => {
  return [
    ...HintCalculatorFrontend.viewActions({
      ctx: input.ctx,
      dispatch: (c) => {
        input.dispatchCmd(GotHintCalculatorMsg.init(c))
      },
      model: input.ctx.hintCalculator,
    }),
    ...UseHintFrontend.viewAction({
      ctx: input.ctx,
      dispatch: input.dispatch,
      model: input.model,
    }),
    ...viewResetAction({
      ctx: input.ctx,
      dispatch: input.dispatch,
      numberlink: input.ctx.numberlink,
      model: input.model,
    }),
  ]
}

const defaultCheckmarkAnimationDuration = TimeSpan.seconds(1 / 2)

const CheckmarkAnimation = (input: { open: boolean; duration?: TimeSpan | null | undefined }) => {
  const duration = input.duration ?? defaultCheckmarkAnimationDuration
  return h(
    Transition,
    {
      id: 'checkmark',
      onEnter: animateCheckmark({
        duration,
      }),
      onExit: async () => {},
      mode: 'out-in',
      class: 'pointer-events-none',
    },
    [
      input.open &&
        h(Box, { class: 'pointer-events-none absolute inset-0 flex items-center justify-center opacity-0' }, [
          h(IconCheckmark, { class: 'pointer-events-none aspect-square w-full opacity-50' }),
        ]),
    ],
  )
}

const animateCheckmark = (input: { duration: TimeSpan }) => async (node: HTMLElement) => {
  node.style.transition = 'all 0.3s ease-in-out'
  node.style.opacity = '0'
  node.style.transform = 'scale(0.8)'
  await sleep(TimeSpan.milliseconds(50))
  node.style.opacity = '1'
  node.style.transform = 'scale(1)'
  await sleep(input.duration)
  node.style.opacity = '0'
  node.style.transform = 'scale(0.8)'
}

const subscriptions = <TMsg>(
  input: { model: Model; ctx: ModePlayFrontendCtx },
  map: (c: unknown) => TMsg,
): Sub<TMsg> => {
  const solutionHash = SolutionHash.init(input.ctx.numberlink)
  if (!solutionHash) return Sub.none()
  return SolutionsDbQueryCache.sub(input.ctx.solutionsDb, solutionHash, map)
}

const TestView = (input: {
  model: Model
  dispatch: (m: Msg) => void
  dispatchCmd: (m: unknown) => void
  ctx: ModePlayFrontendCtx
}) => {
  return h(ScreenLayout, {
    ...input,
    id: 'hint-calculator',
    parentScreen: null,
    actionBar: { variant: { t: 'uniform', actions: viewActions(input) } },
    renderBody: () => null,
  })
}

export const ModePlayFrontend = {
  View,
  viewActions,
  subscriptions,
  TestView,
}
