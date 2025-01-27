import type { Eff } from '~/@/eff'
import { Posix } from '~/@/time/posix'
import { IconArrowLeftOnRect, IconArrowRotateLeft, IconRightLeft, LoadingBar } from '~/app/@/ui'
import { ScreenActions } from '~/app/@/ui/bottom-buttons'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { IconBotCute, IconBotLevel1, IconBotScary, VsBotGame, VsBotSetup } from '~/app/spaces/game/games/@/vs-bot'
import { type BotLevel, allBotLevels, toStatus, toTurn } from '../@/tic-tic-toe/tic-tac-toe'
import { CoverArt, PlayerTypeIcon, ViewBoard, gameTheme } from '../@/tic-tic-toe/tic-tac-toe-ui'
import {
  type ModelFrontend,
  type ModelBackend,
  type MsgFrontend,
  type MsgToFrontend,
  type MsgToBackend,
  handle,
  initSpaceModel,
} from './vs-bot.types'
import { AppFrontendCmd, sendToBackend } from '~/app/@/frontend/cmd'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'

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
  msgCmd?: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>[]
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
      msgCmd: [sendToBackend(msg)],
    }
  }
  const merged = mergeWithBackend({
    ...ctx,
    frontend: model,
    backend: handled.value,
  })
  return { model: merged, msgCmd: [sendToBackend(msg)] }
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
  now: Posix
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
  const vsBotinput: VsBotSetup.VsBotSetupInput = {
    bot: {
      label: input.ctx.t('tic-tac-toe.bot-level', input.model.botLevel),
      renderIcon: (iconinput) =>
        renderBotLevel({
          level: input.model.botLevel,
          ...iconinput,
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
      renderIcon: (input) => <PlayerTypeIcon {...input} playerType='X' />,
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
      renderIcon: (input) => <PlayerTypeIcon {...input} playerType='O' />,
    },
    renderCoverArt: (input) => <CoverArt {...input} />,
    title: input.ctx.t('tic-tac-toe'),
  }

  if (input.model.type === 'setup') {
    return (
      <VsBotSetup.View
        model={input.model.vsBotSetup}
        dispatch={(c) =>
          input.dispatch({
            t: 'vs-bot-setup',
            c,
          })
        }
        {...vsBotinput}
      />
    )
  }

  const vsBotGameInput: VsBotGame.VsBotGameInput = {
    ...vsBotinput,
    human: {
      ...vsBotinput.human,
      userId: input.model.player,
    },
    turn: null,
    isSpectating: false,
  }

  const turn = toTurn(input.model.board)
  const status = toStatus(input.model.board)

  return (
    <div className='flex h-full w-full flex-col'>
      <div className='flex flex-1 flex-col items-center justify-center'>
        <VsBotGame.VsBotPlayerSection {...vsBotGameInput} />

        <LoadingBar
          className='w-full'
          disabled={input.model.userPlayerType === turn || status.type !== 'Turn'}
          color={gameTheme.background}
        />

        <ViewBoard
          board={input.model.board}
          onClick={(position) =>
            input.dispatch({
              t: 'input-move',
              position,
            })
          }
        />
      </div>

      <ScreenActions.View
        id='tic-tac-toe-vs-bot-buttons'
        ctx={input.ctx}
        buttons={[
          {
            icon: (input) => <IconArrowLeftOnRect {...input} />,
            label: input.ctx.t('app.exit'),
            onClick: () =>
              input.dispatch({
                t: 'stop-game',
              }),
          },
          {
            icon: (input) => <IconRightLeft {...input} />,
            label: input.ctx.t('game.swap-sides'),
            onClick: () =>
              input.dispatch({
                t: 'swap-sides',
              }),
          },
          {
            icon: (input) => <IconArrowRotateLeft {...input} />,
            label: input.ctx.t('app.restart'),
            onClick: () =>
              input.dispatch({
                t: 'restart',
              }),
          },
        ]}
        open={false}
        onToggle={() => {}}
      />
    </div>
  )
}

export const ViewMsg = (input: { msg: Msg | MsgToFrontend }) => {
  if ('result' in input.msg && input.msg.result.t === 'err') {
    return input.msg.result.error
  }
  return null
}

export const renderBotLevel = ({ level, ...input }: { level: BotLevel; className?: string }) => {
  switch (level) {
    case 'Easy': {
      return <IconBotCute {...input} />
    }
    case 'Medium': {
      return <IconBotLevel1 {...input} />
    }
    case 'Impossible': {
      return <IconBotScary {...input} />
    }
  }
}
