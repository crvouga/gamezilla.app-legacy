import type { Eff } from '~/@/eff'
import { Box } from '~/@/vdom/primitives/box'
import { UnixMs } from '~/@/time/unix-ms'
import { IconArrowLeft, IconArrowRotateLeft, IconRightLeft } from '~/@/ui/icon'
import { LoadingBar } from '~/@/ui/loading-bar'
import { h } from '~/@/vdom/h'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { IconBotCute, IconBotLevel1, IconBotScary, VsBotGame, VsBotSetup } from '~/app/spaces/game/games/@/vs-bot'
import { type BotLevel, allBotLevels, toStatus, toTurn } from '../@/tic-tic-toe/tic-tac-toe'
import { CoverArt, PlayerTypeIcon, ViewBoard, gameTheme } from '../@/tic-tic-toe/tic-tac-toe-ui'
import {
  type ModelBackend,
  type ModelFrontend,
  type MsgFrontend,
  type MsgToFrontend,
  handle,
  initSpaceModel,
} from './vs-bot.types'

//
//
//
// Model
//
//
//

export type Model = ModelFrontend

export const init = (...input: Parameters<typeof initSpaceModel>): Model => {
  return {
    ...initSpaceModel(...input),
    vsBotSetup: VsBotSetup.init,
  }
}

//
//
//
// Update
//
//
//

export type Msg = MsgFrontend

export const update = ({
  msg,
  model,
  ctx,
}: {
  ctx: SpaceFrontendCtx
  msg: Msg
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.t === 'vs-bot-setup') {
    const updated = VsBotSetup.update(model.vsBotSetup, msg.c)
    return {
      model: {
        ...model,
        vsBotSetup: updated,
      },
    }
  }

  const handled = handle({ ctx, msg, model })
  if (handled.t === 'err') {
    return {
      model,
    }
  }
  const merged = mergeWithBackend({
    ...ctx,
    frontend: model,
    backend: handled.value,
  })
  return { model: merged }
}

export const updateFromBackend = ({
  msg,
  model,
  ctx,
}: {
  ctx: AppFrontendCtx
  msg: MsgToFrontend
  model: Model
}): {
  model: Model
} => {
  if (msg.result.t === 'err') {
    return {
      model,
    }
  }

  const modelNew = mergeWithBackend({
    ...ctx,
    frontend: model,
    backend: msg.result.value,
  })

  return {
    model: modelNew,
  }
}

export const mergeWithBackend = ({
  backend,
  frontend = init({ userId: null }),
}: {
  now: UnixMs
  frontend?: ModelFrontend
  backend: ModelBackend
}): ModelFrontend => {
  return {
    ...frontend,
    ...backend,
  }
}

//
//
//
// View
//
//
//

export const View = (input: {
  ctx: SpaceFrontendCtx
  goBack: () => void
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const vsBotInput: VsBotSetup.VsBotSetupInput = {
    bot: {
      label: input.ctx.t('tic-tac-toe.bot-level', input.model.botLevel),
      renderIcon: (iconInput) =>
        renderBotLevel({
          level: input.model.botLevel,
          ...iconInput,
        }),
    },
    onSwapSides: () =>
      input.dispatch({
        t: 'swap-sides',
      }),
    canStartGame: Boolean(input.model.player),
    ctx: input.ctx,
    human: {
      player: input.model.userPlayerType === 'X' ? 'player-one' : 'player-two',
      userId: input.model.player ?? null,
    },
    onQuit: input.goBack,
    onStartGame: () =>
      input.dispatch({
        t: 'start-game',
      }),
    botVariants: allBotLevels.map((botLevel) => {
      return {
        label: input.ctx.t('tic-tac-toe.bot-level', botLevel),
        renderIcon: (input) =>
          renderBotLevel({
            level: botLevel,
            ...input,
          }),
        onSelect: () =>
          input.dispatch({
            t: 'input-bot-level',
            botLevel,
          }),
      }
    }),
    playerOne: {
      label: input.ctx.t('tic-tac-toe.cross'),
      onStartPlaying: () =>
        input.dispatch({
          t: 'start-playing',
          playerType: 'X',
        }),
      onStopPlaying: () =>
        input.dispatch({
          t: 'stop-playing',
        }),
      renderIcon: (input) => h(PlayerTypeIcon, { ...input, playerType: 'X' }),
    },
    playerTwo: {
      label: input.ctx.t('tic-tac-toe.naught'),
      onStartPlaying: () =>
        input.dispatch({
          t: 'start-playing',
          playerType: 'O',
        }),
      onStopPlaying: () =>
        input.dispatch({
          t: 'stop-playing',
        }),
      renderIcon: (input) => h(PlayerTypeIcon, { ...input, playerType: 'O' }),
    },
    renderCoverArt: (input) => h(CoverArt, input),
    title: input.ctx.t('tic-tac-toe'),
  }

  if (input.model.type === 'setup') {
    return h(VsBotSetup.View, {
      model: input.model.vsBotSetup,
      dispatch: (c) =>
        input.dispatch({
          t: 'vs-bot-setup',
          c,
        }),
      ...vsBotInput,
    })
  }

  const vsBotGameInput: VsBotGame.VsBotGameInput = {
    ...vsBotInput,
    human: {
      ...vsBotInput.human,
      userId: input.model.player,
    },
    turn: null,
    isSpectating: false,
  }

  const board = input.model.board
  const turn = toTurn(board)
  const status = toStatus(board)

  return h(ScreenLayout, {
    dataTestId: 'tic-tac-to/vs-bot-screen',
    parentScreen: input.ctx.parentScreen,
    ctx: input.ctx,
    id: 'tic-tac-toe-vs-bot',
    renderBody: () =>
      h(Box, { class: 'flex flex-col items-center justify-center' }, [
        h(VsBotGame.VsBotPlayerSection, vsBotGameInput),

        h(LoadingBar, {
          class: 'w-full',
          disabled: input.model.userPlayerType === turn || status.type !== 'Turn',
          color: gameTheme.background,
        }),

        h(ViewBoard, {
          board: board,
          onPressDown: (position) => input.dispatch({ t: 'input-move', position }),
        }),
      ]),
    actionBar: {
      variant: {
        t: 'uniform',
        actions: [
          {
            id: input.ctx.t('app.exit'),
            icon: (props) => h(IconArrowLeft, props),
            label: input.ctx.t('app.exit'),
            onPressDown: () =>
              input.dispatch({
                t: 'stop-game',
              }),
          },
          {
            id: input.ctx.t('game.swap-sides'),
            icon: (props) => h(IconRightLeft, props),
            label: input.ctx.t('game.swap-sides'),
            onPressDown: () =>
              input.dispatch({
                t: 'swap-sides',
              }),
          },
          {
            id: input.ctx.t('app.restart'),
            icon: (props) => h(IconArrowRotateLeft, props),
            label: input.ctx.t('app.restart'),
            onPressDown: () =>
              input.dispatch({
                t: 'restart',
              }),
          },
        ],
      },
    },
  })
}

export const ViewMsg = (input: { msg: Msg | MsgToFrontend }) => {
  if ('result' in input.msg && input.msg.result.t === 'err') {
    return input.msg.result.error
  }
  return null
}

export const renderBotLevel = ({ level, ...input }: { level: BotLevel; class?: string }) => {
  switch (level) {
    case 'Easy': {
      return h(IconBotCute, input)
    }
    case 'Medium': {
      return h(IconBotLevel1, input)
    }
    case 'Impossible': {
      return h(IconBotScary, input)
    }
  }
}
