import { Translator } from '~/@/l18n/generated'
import { sleep } from '~/@/promise/sleep'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { IconCheckmark } from '~/@/ui/icon/icon-checkmark'
import { Transition } from '~/@/ui/transition/transition'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { Flow } from '../numberlink'
import { HintCalculatorFrontend } from '../solutions/hint-calculator/frontend'
import { GotHintCalculatorMsg } from '../solutions/hint-calculator/got-hint-calculator-msg'
import { SolutionHash } from '../solutions/solution-hash/solution-hash'
import { SolutionsLoaderFrontend } from '../solutions/solutions-loader/frontend'
import { GotSolutionsLoaderMsg } from '../solutions/solutions-loader/got-solutions-loader-msg'
import { Variant, VariantBoard } from '../variant'
import { ModePlayFrontendCtx } from './frontend/ctx'
import { Model, Msg, toFlow } from './mode-play'
import { UseHint } from './use-hint'
import { UseHintFrontend } from './use-hint/frontend'
import { PrebuiltActions } from '../../../@/ui/prebuilt-actions'

const View = (input: {
  flow: Variant.Model
  model: Model
  dispatch: (m: Msg) => void
  disabled?: boolean
  showSolvedAnimation?: boolean
}) => {
  const flow = toFlow(input.model, input.flow)

  return (
    <div className='relative aspect-square h-full max-h-full w-full touch-none overflow-hidden select-none'>
      <VariantBoard.View
        disabled={input.disabled}
        model={flow}
        showCoordinates={false}
        isDragging={input.model.status.t === 'dragging'}
        onDraggedOver={(nodeId) => input.dispatch({ t: 'user-dragged-over-node', nodeId })}
        onPressDown={(nodeId) => input.dispatch({ t: 'user-pressed-down-node', nodeId })}
        onPressUp={(nodeId) => input.dispatch({ t: 'user-pressed-up-node', nodeId })}
        onLeave={() => input.dispatch({ t: 'user-dragging-left' })}
        autocompleteEdge={
          input.model.status.t === 'dragging' && input.model.status.autocompleteEdge
            ? { ...input.model.status.autocompleteEdge, groupId: input.model.status.activeGroupId }
            : null
        }
        isGroupActive={(groupId) => input.model.status.t === 'dragging' && input.model.status.activeGroupId === groupId}
        usedHints={UseHint.toUsedHints(input.model)}
      />

      <CheckmarkAnimation open={Boolean(input.model.showCheckmarkAnimation && input.showSolvedAnimation)} />
    </div>
  )
}

const viewResetAction = (input: {
  flow: Variant.Model
  model: Model
  dispatch: (m: Msg) => void
  ctx: {
    t: Translator
  }
}): ScreenAction[] => {
  const flow = toFlow(input.model, input.flow)
  const disabled = Flow.isPipesEmpty(flow)
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
      flow: input.ctx.flow,
      model: input.model,
    }),
  ]
}

const defaultCheckmarkAnimationDuration = TimeSpan.seconds(1 / 2)

const CheckmarkAnimation = (input: { open: boolean; duration?: TimeSpan | null | undefined }) => {
  const duration = input.duration ?? defaultCheckmarkAnimationDuration
  return (
    <Transition
      id='checkmark'
      onEnter={animateCheckmark({
        duration,
      })}
      onExit={async () => {}}
      mode='out-in'
      className='pointer-events-none'
    >
      {input.open && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center opacity-0'>
          <IconCheckmark className='pointer-events-none aspect-square w-full opacity-50' />
        </div>
      )}
    </Transition>
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

const subscriptions = <TMsg,>(
  input: { model: Model; ctx: ModePlayFrontendCtx },
  map: (c: unknown) => TMsg,
): Sub<TMsg> => {
  const solutionHash = SolutionHash.init(input.ctx.flow)
  if (!solutionHash) return Sub.none()
  return Sub.map(
    SolutionsLoaderFrontend.watch(input.ctx, solutionHash, (c) => GotSolutionsLoaderMsg.init(c)),
    map,
  )
}

const TestView = (input: {
  model: Model
  dispatch: (m: Msg) => void
  dispatchCmd: (m: unknown) => void
  ctx: ModePlayFrontendCtx
}) => {
  return (
    <ScreenLayout
      {...input}
      id='hint-calculator'
      parentScreen={null}
      actionBar={{ variant: { t: 'uniform', actions: viewActions(input) } }}
      renderBody={() => null}
    />
  )
}

export const ModePlayFrontend = {
  View,
  viewActions,
  subscriptions,
  TestView,
}
