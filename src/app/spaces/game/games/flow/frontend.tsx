import { Eff } from '~/@/eff'
import { withEventId } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { IconGamepad, IconScrewdriverWrench } from '~/app/@/ui'
import { SpaceFrontendCmd } from '~/app/spaces/@/frontend/cmd'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { CoverArt } from './@/cover-art'
import { FlowFrontendCmd } from './@/frontend/cmd'
import type { FlowFrontendCtx } from './@/frontend/ctx'
import { FlowFrontendEvt } from './@/frontend/evt'
import { IPackDb } from './@/pack/pack-db'
import { PackDbQueryTypes } from './@/pack/pack-db-query'
import { PackDbQueryFrontend } from './@/pack/pack-db-query/frontend'
import { PackDb } from './@/pack/pack-db/impl'
import { IPuzzleDb, PuzzleDb } from './@/puzzle/puzzle-db'
import { PuzzleDbQueryTypes } from './@/puzzle/puzzle-db-query'
import { PuzzleDbQueryFrontend } from './@/puzzle/puzzle-db-query/frontend'
import { Solutions } from './@/solutions/solutions'
import { BuildFrontend } from './screen-build/frontend'
import { PlayFrontend } from './screen-play/frontend'
import type { FrontendModule, ModelFrontend, MsgFrontend, MsgToBackend } from './types'

const init: FrontendModule['init'] = {
  screenBuild: BuildFrontend.init,
  screenPlay: PlayFrontend.init,
  puzzles: {},
  packs: {},
  solutions: Solutions.init,
  puzzleDbQuery: PuzzleDbQueryTypes.initFrontend,
  packDbQuery: PackDbQueryTypes.initFrontend,
}

let puzzleDb: IPuzzleDb
let packDb: IPackDb
const toFlowFrontendCtx = (input: Parameters<FrontendModule['update']>[0]): FlowFrontendCtx => {
  puzzleDb ??= PuzzleDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: input.ctx.logger })
  packDb ??= PackDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: input.ctx.logger })
  return {
    ...input.ctx,
    puzzleDb,
    packDb,
    packs: input.model.packs,
    puzzles: input.model.puzzles,
    puzzleDbQuery: input.model.puzzleDbQuery,
    packDbQuery: input.model.packDbQuery,
    solutions: input.model.solutions,
  }
}

const update = (
  input: Parameters<FrontendModule['update']>[0],
): ReturnType<FrontendModule['update']> & {
  msgCmd?: SpaceFrontendCmd<{ MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }>[]
} => {
  const acc = updateChild(input)
  const updated = updateLoop(input, acc)
  return {
    ...updated,
    msgCmd: FlowFrontendCmd.toSpaceFrontendCmd(updated.msgCmd),
  }
}

const updateLoop = (
  input: Parameters<FrontendModule['update']>[0],
  acc: ReturnType<FrontendModule['update']>,
): ReturnType<FrontendModule['update']> => {
  const [evt, ...restEvt] = FlowFrontendEvt.toFlowFrontendEvt(acc.msgEvt)

  if (evt) {
    const updated = updateChild({
      ctx: input.ctx,
      modelSpace: input.modelSpace,
      model: acc.model,
      msgEvt: evt,
    })

    return updateLoop(input, {
      model: updated.model,
      msgEvt: Msg.batch(restEvt, updated.msgEvt, FlowFrontendEvt.toSpaceFrontendEvt(acc.msgEvt)),
      eff: Eff.batch(acc.eff, updated.eff),
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
    })
  }

  const [cmd, ...restCmd] = FlowFrontendCmd.toFlowFrontendCmd(acc.msgCmd)

  if (cmd) {
    const updated = updateChild({
      ctx: input.ctx,
      modelSpace: input.modelSpace,
      model: acc.model,
      msgCmd: cmd,
    })

    return updateLoop(input, {
      model: updated.model,
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
      eff: Eff.batch(acc.eff, updated.eff),
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
      msgCmd: Msg.batch(restCmd, updated.msgCmd, FlowFrontendCmd.toSpaceFrontendCmd(acc.msgCmd)),
    })
  }

  return acc
}

const updateChild: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => GameMainMenu.update({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateModePlay({ ...input, model }),
    (model) => updateModeBuilder({ ...input, model }),
    (model) => updatePackDbQuery({ ...input, model }),
    (model) => updatePuzzleDbQuery({ ...input, model }),
  )
}

const updatePuzzleDbQuery: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = PuzzleDbQueryFrontend.update({
    ctx,
    model: input.model.puzzleDbQuery,
    msg: input.msg?.t === 'puzzle-db-query' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'puzzle-db-query' ? input.msgCmd : null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'puzzle-db-query' ? input.msgBackend.c : null,
  })

  return {
    model: { ...input.model, puzzleDbQuery: updated.model },
    eff: Eff.tag('puzzle-db-query', updated.eff),
    msgCmd: FlowFrontendCmd.tag('puzzle-db-query', updated.msgCmd),
    msgEvt: [],
  }
}

const updatePackDbQuery: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = PackDbQueryFrontend.update({
    ctx,
    model: input.model.packDbQuery,
    msg: input.msg?.t === 'pack-db-query' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'pack-db-query' ? input.msgCmd : null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'pack-db-query' ? input.msgBackend.c : null,
  })

  return {
    model: { ...input.model, packDbQuery: updated.model },
    eff: Eff.tag('pack-db-query', updated.eff),
    msgCmd: FlowFrontendCmd.tag('pack-db-query', updated.msgCmd),
    msgEvt: [],
  }
}

const updateModePlay: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = PlayFrontend.update({
    ctx,
    modelSpace: input.modelSpace.screenPlay,
    model: input.model.screenPlay,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'got-msg-play' ? input.msgBackend.c : null,
    msgSpace: input.msgSpace?.t === 'got-msg-play' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    msg: input.msg?.t === 'got-msg-play' ? input.msg.c : null,
  })

  return {
    model: { ...input.model, screenPlay: updated.model },
    eff: Eff.tag('got-msg-play', updated.eff),
    msgEvt: [],
    msgCmd: FlowFrontendCmd.tag('got-msg-play', updated.msgCmd),
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'got-msg-play' })),
  }
}

const updateModeBuilder: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = BuildFrontend.update({
    ctx,
    modelSpace: input.modelSpace.screenBuild,
    model: input.model.screenBuild,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'got-msg-build' ? input.msgBackend.c : null,
    msgSpace: input.msgSpace?.t === 'got-msg-build' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    msg: input.msg?.t === 'got-msg-build' ? input.msg.c : null,
  })

  return {
    model: { ...input.model, screenBuild: updated.model },
    eff: Eff.tag('got-msg-build', updated.eff),
    msgCmd: FlowFrontendCmd.tag('got-msg-build', updated.msgCmd),
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'got-msg-build' })),
    msgEvt: [],
  }
}

const updateFromMsgSpace: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-changed-mode': {
      return {
        model: {
          ...input.model,
          screenPlay: PlayFrontend.init,
          screenBuild: BuildFrontend.init,
        },
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
        msgEvt: [
          {
            t: 'flow-evt.user-changed-mode',
            mode: input.msgSpace.mode,
            userId: input.msgSpace.userId,
          },
        ],
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-msg-space': {
      const msgSpace = withEventId(input.msg.c)
      return { model: input.model, msgSpace: [msgSpace] }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const updateFromCmd: FrontendModule['update'] = (input) => {
  switch (input.msgCmd?.t) {
    case 'flow-cmd.add-packs': {
      return {
        model: {
          ...input.model,
          packs: {
            ...input.model.packs,
            ...input.msgCmd.packs,
          },
        },
      }
    }

    case 'flow-cmd.add-puzzles': {
      return {
        model: {
          ...input.model,
          puzzles: {
            ...input.model.puzzles,
            ...input.msgCmd.puzzles,
          },
        },
      }
    }

    case 'flow-cmd.add-solutions': {
      return {
        model: {
          ...input.model,
          solutions: Solutions.merge(input.model.solutions, input.msgCmd.solutions),
        },
      }
    }

    case 'flow-cmd.remove-puzzles': {
      const puzzlesNew: ModelFrontend['puzzles'] = { ...input.model.puzzles }
      for (const id of Object.values(input.msgCmd.puzzles)) {
        delete puzzlesNew[id]
      }
      return {
        model: {
          ...input.model,
          puzzles: puzzlesNew,
        },
      }
    }

    case 'pack-db-query': {
      return {
        model: input.model,
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

//
//
//
//
//
//
//
//

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  switch (input.modelSpace.mode) {
    case 'build': {
      const ctx = toFlowFrontendCtx(input)
      return Sub.tag(
        'got-msg-build',
        BuildFrontend.subscriptions({ ctx, modelSpace: input.modelSpace.screenBuild, model: input.model.screenBuild }),
      )
    }

    case 'play': {
      const ctx = toFlowFrontendCtx(input)
      return Sub.tag(
        'got-msg-play',
        PlayFrontend.subscriptions({ ctx, modelSpace: input.modelSpace.screenPlay, model: input.model.screenPlay }),
      )
    }

    case 'none': {
      return Sub.None
    }
  }
}

//
//
// View
//
//

const View: FrontendModule['View'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  switch (input.modelSpace.mode) {
    case 'none': {
      return (
        <GameMainMenu.View
          renderCoverArt={(input) => <CoverArt {...input} />}
          ctx={ctx}
          title={ctx.t('flow')}
          dispatch={input.dispatch}
          onBack={() => input.dispatch({ t: 'game-main-menu.clicked-exit-game-button' })}
          buttons={[
            {
              renderIcon: (input) => <IconGamepad {...input} />,
              title: ctx.t('flow.play'),
              description: ctx.t('flow.play-description'),
              onClick: () => {
                input.dispatch({
                  t: 'got-msg-space',
                  c: {
                    t: 'user-changed-mode',
                    mode: 'play',
                    userId: input.ctx.currentUserId,
                  },
                })
              },
            },
            {
              renderIcon: (input) => <IconScrewdriverWrench {...input} />,
              title: ctx.t('flow.build'),
              description: ctx.t('flow.build-description'),
              onClick: () => {
                input.dispatch({
                  t: 'got-msg-space',
                  c: {
                    t: 'user-changed-mode',
                    mode: 'build',
                    userId: input.ctx.currentUserId,
                  },
                })
              },
            },
          ]}
        />
      )
    }

    case 'build': {
      return (
        <BuildFrontend.View
          ctx={ctx}
          dispatch={(c) => input.dispatch({ t: 'got-msg-build', c })}
          modelSpace={input.modelSpace.screenBuild}
          model={input.model.screenBuild}
        />
      )
    }

    case 'play': {
      return (
        <PlayFrontend.View
          ctx={ctx}
          dispatch={(c) => input.dispatch({ t: 'got-msg-play', c })}
          modelSpace={input.modelSpace.screenPlay}
          model={input.model.screenPlay}
        />
      )
    }
  }
}

const ViewFeedItem: FrontendModule['ViewFeedItem'] = (_input) => {
  return null
}

export const FlowFrontend = {
  init,
  subscriptions,
  update,
  View,
  ViewFeedItem,
}
