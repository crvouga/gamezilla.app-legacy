import { Translator } from '~/@/l18n/generated'
import { TimeSpan } from '~/@/time/time-span'
import { IconCheckmark } from '~/@/ui'
import { Transition } from '~/@/ui/transition/transition'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { PrebuiltActions } from '../../../@/ui/prebuilt-actions'
import { Flow } from '../flow'
import { HintCalculatorTypes } from '../solutions/hint-calculator'
import { HintCalculatorFrontend } from '../solutions/hint-calculator/frontend'
import { Variant, VariantBoard } from '../variant'
import { ModePlayFrontendCtx } from './frontend/ctx'
import { Model, Msg, toFlow, toStatus } from './mode-play'
import { UseHint } from './use-hint'
import { UseHintFrontend } from './use-hint/frontend'

const View = (input: {
  flow: Variant.Model
  model: Model
  dispatch: (m: Msg) => void
  disabled?: boolean
  showSolvedAnimation?: boolean
}) => {
  const flow = toFlow(input.model, input.flow)

  return (
    <div className='relative aspect-square h-full max-h-full w-full touch-none select-none overflow-hidden'>
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
  dispatchHintCalculator: (m: HintCalculatorTypes.MsgFrontend) => void
  ctx: ModePlayFrontendCtx
}): ScreenAction[] => {
  const status = toStatus({ flow: input.ctx.flow, model: input.model })
  return [
    ...HintCalculatorFrontend.viewAction({
      ctx: input.ctx,
      dispatch: input.dispatchHintCalculator,
      model: input.ctx.HintCalculator,
    }),
    ...UseHintFrontend.viewAction({
      ctx: input.ctx,
      dispatch: input.dispatch,
      model: input.model,
      disabled: status === 'solved',
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
  await new Promise((r) => setTimeout(r, 50))
  node.style.opacity = '1'
  node.style.transform = 'scale(1)'
  await new Promise((r) => setTimeout(r, TimeSpan.toMilliseconds(input.duration)))
  node.style.opacity = '0'
  node.style.transform = 'scale(0.8)'
}

export const ModePlayFrontend = {
  ...UseHintFrontend,
  View,
  viewActions,
}
