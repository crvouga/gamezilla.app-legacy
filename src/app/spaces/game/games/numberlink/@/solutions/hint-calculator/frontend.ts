import { pipe } from '~/@/function/pipe'
import { isErr, Loading, mapErr, mapOk } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'
import { IconLightbulb } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ShowErrorSmall } from '~/app/@/frontend/show-error-small'
import { ShowOkSmall } from '~/app/@/frontend/show-ok-small'
import { ShowWarningSmall } from '~/app/@/frontend/show-warning-small'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { FloatingConfirmation } from '~/app/@/ui/floating/confirmation/floating-confirmation'
import { AlgoSolveAsync } from '../algo-solve-async'
import { problemToString } from '../algo-solve-async/algo-solve-async'
import { SolutionHash } from '../solution-hash/solution-hash'
import { Solutions } from '../solutions'
import { SolutionsDbQueryCache } from '../solutions-db-query-cache'
import { GotHintCalculatorMsg } from './got-hint-calculator-msg.$msg'
import { FindSolutionRequest, FoundSolutionResult, initFrontend, ModelFrontend, type FrontendModule } from './types'

const update: FrontendModule['update'] = (input) => {
  if (GotHintCalculatorMsg.is(input.msgIn)) {
    return update({ ...input, msgIn: null, msg: input.msgIn.c.msg })
  }

  switch (input.msg?.t) {
    case 'dialog.clicked-open': {
      const isOpen = input.model.hintCalculator_open === 'find-solutions-confirmation'
      if (isOpen) {
        return {
          model: { ...input.model, hintCalculator_open: null },
          msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceClosed)],
        }
      }
      return {
        model: { ...input.model, hintCalculator_open: 'find-solutions-confirmation' },
        msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceOpened)],
      }
    }
    case 'dialog.clicked-close': {
      return {
        model: { ...input.model, hintCalculator_open: null },
        msgOut: [PlaySoundCmd.init(APP_SOUND.surfaceClosed)],
      }
    }
    case 'clicked-find-solutions': {
      const { numberlink: flow } = input.msg
      const hash = SolutionHash.init(flow)
      const requestNew: FindSolutionRequest = {
        hash,
        result: Loading,
      }
      return {
        model: {
          ...input.model,
          hintCalculator_requests: {
            ...input.model.hintCalculator_requests,
            [hash]: requestNew,
          },
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff(dispatch) {
          const solved = await AlgoSolveAsync.solveInProcess({
            model: flow,
            logger: input.ctx.logger,
            maxDuration: TimeSpan.seconds(10),
          })
          const found: FoundSolutionResult = pipe(
            solved,
            (s) => mapOk(s, (solution) => Solutions.of(solution ? [solution] : [])),
            (s) => mapOk(s, (solutions) => ({ solutions })),
            (s) => mapErr(s, problemToString),
          )
          dispatch({ t: 'found-solution', numberlink: flow, found })
        },
      }
    }
    case 'found-solution': {
      const result = input.msg.found
      const hash = SolutionHash.init(input.msg.numberlink)
      const requestNew: FindSolutionRequest = { hash, result }
      return {
        model: {
          ...input.model,
          hintCalculator_requests: { ...input.model.hintCalculator_requests, [hash]: requestNew },
          hintCalculator_open: null,
        },
        msgOut: isErr(result)
          ? ShowErrorSmall.init(input.ctx.t('app.something-went-wrong'), result.error)
          : Solutions.isEmpty(result.value.solutions)
            ? ShowWarningSmall.init(input.ctx.t('game.numberlink.no-solutions-found'))
            : ShowOkSmall.init(input.ctx.t('game.numberlink.solutions-found')),
        async eff() {
          if (isErr(result)) return
          await input.ctx.solutionsDb.put(result.value.solutions)
        },
      }
    }
  }
  return { model: input.model }
}

const TEST_ID_HINT_CALCULATOR_ACTION = 'hint-calculator'

const viewActions = (input: Parameters<FrontendModule['View']>[0]): ScreenAction[] => {
  const { numberlink } = input.ctx
  if (!numberlink) return []
  const hash = SolutionHash.init(numberlink)
  const solutions = SolutionsDbQueryCache.read(input.ctx, hash)
  const hasSolution = solutions.length > 0
  if (hasSolution) return []
  return [
    {
      id: input.ctx.t('game.hint'),
      renderIcon: (input) => h(IconLightbulb, input),
      label: input.ctx.t('game.hint'),
      onPress: () => input.dispatch({ t: 'dialog.clicked-open' }),
      testId: TEST_ID_HINT_CALCULATOR_ACTION,
      renderSurface: ({ dropDown }) =>
        h(FloatingConfirmation, {
          title: input.ctx.t('game.numberlink.no-hints-available'),
          body: input.ctx.t('game.numberlink.no-hints-available-body'),
          ctx: input.ctx,
          dropDown: dropDown,
          id: TEST_ID_HINT_CALCULATOR_ACTION,
          ariaLabel: input.ctx.t('game.numberlink.no-hints-available'),
          onClose: () => input.dispatch({ t: 'dialog.clicked-close' }),
          open: input.model.hintCalculator_open === 'find-solutions-confirmation',
          onCancel: () => input.dispatch({ t: 'dialog.clicked-close' }),
          cancelText: input.ctx.t('app.cancel'),
          position: 'bottom',
          confirmText: input.ctx.t('app.calculate'),
          confirmLoading: isLoading(input.model, hash),
          onConfirm: () => input.dispatch({ t: 'clicked-find-solutions', numberlink }),
        }),
    },
  ]
}

const isLoading = (model: ModelFrontend, hash: SolutionHash): boolean => {
  return model.hintCalculator_requests[hash]?.result.t === 'loading'
}

const TestView: FrontendModule['View'] = (input) => {
  return h(ScreenLayout, {
    ...input,
    id: 'hint-calculator',
    parentScreen: null,
    actionBar: { variant: { t: 'uniform', actions: viewActions(input) } },
    renderBody: () => null,
  })
}

export const HintCalculatorFrontend = {
  init: initFrontend,
  isLoading,
  update,
  viewActions,
  TestView,
  TEST_ID_HINT_CALCULATOR_ACTION,
}
