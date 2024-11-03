import type { Eff, Posix } from 'gamezilla-app/@/core'
import { type ClientCmd, type ClientCtx, sendToServer } from 'gamezilla-app/app/@/client'
import { IconArrowLeftOnRect, IconArrowRotateLeft, IconRightLeft, LoadingBar } from 'gamezilla-app/app/@/ui'
import type { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space'
import { IconBotCute, IconBotLevel1, IconBotScary, VsBotGame, VsBotSetup } from 'gamezilla-app/app/spaces/game/@/vs-bot'
import { type BotLevel, allBotLevels, toStatus, toTurn } from '../@/tic-tic-toe/tic-tac-toe'
import { CoverArt, PlayerTypeIcon, ViewBoard, gameTheme } from '../@/tic-tic-toe/tic-tac-toe-ui'
import {
  type ModelClient,
  type ModelServer,
  type MsgClient,
  type MsgToClient,
  type MsgToServer,
  handle,
  initCoreModel
} from './vs-bot.types'
import { ViewBottomButtonBar, ViewBottomButtonBarAction } from 'gamezilla-app/app/@/ui/actions'

//
//
//
// Model
//
//
//

export type Model = ModelClient

export const init = (...input: Parameters<typeof initCoreModel>): Model => {
  return {
    ...initCoreModel(...input),
    vsBotSetup: VsBotSetup.init
  }
}

//
//
//
// Update
//
//
//

export type Msg = MsgClient

export const update = ({
  msg,
  model,
  ctx
}: {
  ctx: SpaceClientCtx
  msg: Msg
  model: Model
}): {
  model: Model

  eff?: Eff<Msg>
  msgCmd?: ClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>[]
} => {
  if (msg.t === 'vs-bot-setup') {
    const updated = VsBotSetup.update(model.vsBotSetup, msg.c)
    return {
      model: {
        ...model,
        vsBotSetup: updated
      }
    }
  }

  const handled = handle({ ctx, msg, model })
  if (handled.t === 'err') {
    return {
      model,
      msgCmd: [sendToServer(msg)]
    }
  }
  const merged = mergeWithServer({
    ...ctx,
    client: model,
    server: handled.value
  })
  return { model: merged, msgCmd: [sendToServer(msg)] }
}

export const updateFromServer = ({
  msg,
  model,
  ctx
}: {
  ctx: ClientCtx
  msg: MsgToClient
  model: Model
}): {
  model: Model
} => {
  if (msg.result.t === 'err') {
    return {
      model
    }
  }

  const modelNew = mergeWithServer({
    ...ctx,
    client: model,
    server: msg.result.value
  })

  return {
    model: modelNew
  }
}

export const mergeWithServer = ({
  server,
  client = init({ userId: null })
}: {
  now: Posix
  client?: ModelClient
  server: ModelServer
}): ModelClient => {
  return {
    ...client,
    ...server
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
  ctx: SpaceClientCtx
  goBack: () => void
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const vsBotinput: VsBotSetup.VsBotSetupinput = {
    bot: {
      label: input.ctx.t('tic-tac-toe.bot-level', input.model.botLevel),
      renderIcon: (iconinput) =>
        renderBotLevel({
          level: input.model.botLevel,
          ...iconinput
        })
    },
    onSwapSides: () =>
      input.dispatch({
        t: 'swap-sides'
      }),
    canStartGame: Boolean(input.model.player),
    ctx: input.ctx,
    human: {
      player: input.model.userPlayerType === 'X' ? 'player-one' : 'player-two',
      userId: input.model.player ?? null
    },
    onQuit: input.goBack,
    onStartGame: () =>
      input.dispatch({
        t: 'start-game'
      }),
    botVariants: allBotLevels.map((botLevel) => {
      return {
        label: input.ctx.t('tic-tac-toe.bot-level', botLevel),
        renderIcon: (input) =>
          renderBotLevel({
            level: botLevel,
            ...input
          }),
        onSelect: () =>
          input.dispatch({
            t: 'input-bot-level',
            botLevel
          })
      }
    }),
    playerOne: {
      label: input.ctx.t('tic-tac-toe.cross'),
      onStartPlaying: () =>
        input.dispatch({
          t: 'start-playing',
          playerType: 'X'
        }),
      onStopPlaying: () =>
        input.dispatch({
          t: 'stop-playing'
        }),
      renderIcon: (input) => <PlayerTypeIcon {...input} playerType='X' />
    },
    playerTwo: {
      label: input.ctx.t('tic-tac-toe.naught'),
      onStartPlaying: () =>
        input.dispatch({
          t: 'start-playing',
          playerType: 'O'
        }),
      onStopPlaying: () =>
        input.dispatch({
          t: 'stop-playing'
        }),
      renderIcon: (input) => <PlayerTypeIcon {...input} playerType='O' />
    },
    renderCoverArt: (input) => <CoverArt {...input} />,
    title: input.ctx.t('tic-tac-toe')
  }

  if (input.model.type === 'setup') {
    return (
      <VsBotSetup.View
        model={input.model.vsBotSetup}
        dispatch={(c) =>
          input.dispatch({
            t: 'vs-bot-setup',
            c
          })
        }
        {...vsBotinput}
      />
    )
  }

  const vsBotGameinput: VsBotGame.VsBotGameinput = {
    ...vsBotinput,
    human: {
      ...vsBotinput.human,
      userId: input.model.player
    },
    turn: null,
    isSpectating: false
  }

  const turn = toTurn(input.model.board)
  const status = toStatus(input.model.board)

  return (
    <div className='flex h-full w-full flex-col '>
      <div className='flex flex-1 flex-col items-center justify-center'>
        <VsBotGame.VsBotPlayerSection {...vsBotGameinput} />

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
              position
            })
          }
        />
      </div>

      <ViewBottomButtonBar>
        <ViewBottomButtonBarAction
          icon={(input) => <IconArrowLeftOnRect {...input} />}
          label={input.ctx.t('app.exit')}
          onClick={() =>
            input.dispatch({
              t: 'stop-game'
            })
          }
        />
        <ViewBottomButtonBarAction
          icon={(input) => <IconRightLeft {...input} />}
          label={input.ctx.t('game.swap-sides')}
          onClick={() =>
            input.dispatch({
              t: 'swap-sides'
            })
          }
        />
        <ViewBottomButtonBarAction
          icon={(input) => <IconArrowRotateLeft {...input} />}
          label={input.ctx.t('app.restart')}
          onClick={() =>
            input.dispatch({
              t: 'restart'
            })
          }
        />
      </ViewBottomButtonBar>
    </div>
  )
}

export const ViewMsg = (input: { msg: Msg | MsgToClient }) => {
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
