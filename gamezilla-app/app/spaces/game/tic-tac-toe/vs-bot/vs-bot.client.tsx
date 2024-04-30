import {
  ViewBottomButtonBar,
  ViewBottomButtonBarAction,
} from "gamezilla-app/app/spaces/game/@SHARED/game"
import {
  IconBotCute,
  IconBotLevel1,
  IconBotScary,
  VsBotGame,
  VsBotSetup,
} from "gamezilla-app/app/spaces/game/@SHARED/vs-bot"
import { SpaceClientCtx } from "gamezilla-app/app/spaces/@SHARED/space"
import {
  ClientCmd,
  ClientCtx,
  sendToServer,
} from "gamezilla-app/app/@SHARED/client"
import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconRightLeft,
  LoadingBar,
} from "gamezilla-app/app/@SHARED/ui"
import { Eff, Posix } from "gamezilla-app/@SHARED/core"
import {
  BotLevel,
  allBotLevels,
  toStatus,
  toTurn,
} from "../@SHARED/tic-tic-toe/tic-tac-toe"
import {
  CoverArt,
  PlayerTypeIcon,
  ViewBoard,
  gameTheme,
} from "../@SHARED/tic-tic-toe/tic-tac-toe-ui"
import {
  ModelClient,
  MsgClient,
  ModelServer,
  MsgToClient,
  MsgToServer,
  handle,
  initCoreModel,
} from "./vs-bot.core"

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

export type Msg = MsgClient

export const update = ({
  msg,
  model,
  ctx,
}: {
  ctx: SpaceClientCtx
  msg: Msg
  model: Model
}): {
  model: Model

  eff?: Eff<Msg>
  msgCmd?: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>[]
} => {
  if (msg.t === "vs-bot-setup") {
    const updated = VsBotSetup.update(model.vsBotSetup, msg.c)
    return { model: { ...model, vsBotSetup: updated } }
  }

  const handled = handle({ ctx, msg, model })
  if (handled.t === "err") {
    return { model, msgCmd: [sendToServer(msg)] }
  }
  const merged = mergeWithServer({
    ...ctx,
    client: model,
    server: handled.value,
  })
  return { model: merged, msgCmd: [sendToServer(msg)] }
}

export const updateFromServer = ({
  msg,
  model,
  ctx,
}: {
  ctx: ClientCtx
  msg: MsgToClient
  model: Model
}): {
  model: Model
} => {
  if (msg.result.t === "err") {
    return {
      model,
    }
  }

  const modelNew = mergeWithServer({
    ...ctx,
    client: model,
    server: msg.result.value,
  })

  return {
    model: modelNew,
  }
}

export const mergeWithServer = ({
  server,
  client = init({ userId: null }),
}: {
  now: Posix
  client?: ModelClient
  server: ModelServer
}): ModelClient => {
  return {
    ...client,
    ...server,
  }
}

//
//
//
// View
//
//
//

export const View = (props: {
  ctx: SpaceClientCtx
  goBack: () => void
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const vsBotProps: VsBotSetup.VsBotSetupProps = {
    bot: {
      label: props.model.botLevel,
      renderIcon: (iconProps) =>
        renderBotLevel({ level: props.model.botLevel, ...iconProps }),
    },
    onSwapSides: () => props.dispatch({ t: "swap-sides" }),
    canStartGame: Boolean(props.model.player),
    ctx: props.ctx,
    human: {
      player: props.model.userPlayerType === "X" ? "player-one" : "player-two",
      userId: props.model.player ?? null,
    },
    onQuit: props.goBack,
    onStartGame: () => props.dispatch({ t: "start-game" }),
    botVariants: allBotLevels.map((botLevel) => {
      return {
        label: botLevel,
        renderIcon: (props) => renderBotLevel({ level: botLevel, ...props }),
        onSelect: () => props.dispatch({ t: "input-bot-level", botLevel }),
      }
    }),
    playerOne: {
      label: "Cross",
      onStartPlaying: () =>
        props.dispatch({ t: "start-playing", playerType: "X" }),
      onStopPlaying: () => props.dispatch({ t: "stop-playing" }),
      renderIcon: (props) => <PlayerTypeIcon {...props} playerType="X" />,
    },
    playerTwo: {
      label: "Naught",
      onStartPlaying: () =>
        props.dispatch({ t: "start-playing", playerType: "O" }),
      onStopPlaying: () => props.dispatch({ t: "stop-playing" }),
      renderIcon: (props) => <PlayerTypeIcon {...props} playerType="O" />,
    },
    renderCoverArt: (props) => <CoverArt {...props} />,
    title: "Tic-Tac-Toe",
  }

  if (props.model.type === "setup") {
    return (
      <VsBotSetup.View
        model={props.model.vsBotSetup}
        dispatch={(c) => props.dispatch({ t: "vs-bot-setup", c })}
        {...vsBotProps}
      />
    )
  }

  const vsBotGameProps: VsBotGame.VsBotGameProps = {
    ...vsBotProps,
    human: {
      ...vsBotProps.human,
      userId: props.model.player,
    },
    turn: null,
    isSpectating: false,
  }

  const turn = toTurn(props.model.board)
  const status = toStatus(props.model.board)

  return (
    <div className="flex h-full w-full flex-col ">
      <div className="flex flex-1 flex-col items-center justify-center">
        <VsBotGame.VsBotPlayerSection {...vsBotGameProps} />

        <LoadingBar
          className="w-full"
          disabled={
            props.model.userPlayerType === turn || status.type !== "Turn"
          }
          color={gameTheme.background}
        />

        <ViewBoard
          board={props.model.board}
          onClick={(position) => props.dispatch({ t: "input-move", position })}
        />
      </div>

      <ViewBottomButtonBar>
        <ViewBottomButtonBarAction
          icon={(props) => <IconArrowLeftOnRect {...props} />}
          label="Exit"
          onClick={() => props.dispatch({ t: "stop-game" })}
        />
        <ViewBottomButtonBarAction
          icon={(props) => <IconRightLeft {...props} />}
          label="Swap sides"
          onClick={() => props.dispatch({ t: "swap-sides" })}
        />
        <ViewBottomButtonBarAction
          icon={(props) => <IconArrowRotateLeft {...props} />}
          label="Restart"
          onClick={() => props.dispatch({ t: "restart" })}
        />
      </ViewBottomButtonBar>
    </div>
  )
}

export const ViewMsg = (props: { msg: Msg | MsgToClient }) => {
  if ("result" in props.msg && props.msg.result.t === "err") {
    return props.msg.result.error
  }
  return null
}

export const renderBotLevel = ({
  level,
  ...props
}: {
  level: BotLevel
  className?: string
}) => {
  switch (level) {
    case "Easy": {
      return <IconBotCute {...props} />
    }
    case "Medium": {
      return <IconBotLevel1 {...props} />
    }
    case "Impossible": {
      return <IconBotScary {...props} />
    }
  }
}
