import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { TopBar } from '~/app/@/ui'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { FlowFrontendCtx } from '../../@/frontend/ctx'
import { PuzzleDbQuery } from '../../@/puzzle/puzzle-db/query'
import { PuzzleListFrontend } from '../../@/puzzle/puzzle-list/frontend'
import type { FrontendModule, ModelSpace } from '../types'
import { CreateNewPuzzleFrontend } from './create-new-puzzle/frontend'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => CreateNewPuzzleFrontend.update({ ...input, model }),
    (model) => updateMain({ ...input, model }),
  )
}

const updateMain: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-puzzle-builder-open.clicked-puzzle-list-item': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navForwardMin)] }
    }
    case 'screen-puzzle-builder-open.puzzle-list-query-changed': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.tap)] }
    }
  }

  switch (input.msg?.t) {
    case 'screen-puzzle-builder-open.got-puzzle-list-msg': {
      return { model: input.model, msgCmd: [PuzzleListFrontend.gotMsg(input.msg.c)] }
    }
  }

  return { model: input.model }
}

const toPuzzleQuery = (input: { ctx: FlowFrontendCtx; modelSpace: ModelSpace }): PuzzleDbQuery => {
  return (
    input.modelSpace.screenPuzzleBuilderOpen?.query ?? {
      order: {
        lastUpdatedAt: 'desc',
      },
      pagination: {
        offset: 0,
        limit: 10,
      },
      where: {
        createdBy: {
          equals: input.ctx.currentUserId,
        },
      },
    }
  )
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  const query = toPuzzleQuery(input)
  return PuzzleListFrontend.watch(input.ctx, query, (c) => ({
    t: 'screen-puzzle-builder-open.got-puzzle-list-msg',
    c,
  }))
}

const View: FrontendModule['View'] = (input) => {
  const query = toPuzzleQuery(input)
  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden'>
      <TopBar
        onBack={() =>
          input.dispatch({ t: 'got-msg-space', c: { t: 'user-clicked-back-button', userId: input.ctx.currentUserId } })
        }
        ctx={input.ctx}
        title={input.ctx.t('flow.puzzle-builder')}
      />
      <PuzzleListFrontend.View
        ctx={input.ctx}
        model={input.ctx.puzzleList}
        query={query}
        onQueryChanged={(query) => {
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'screen-puzzle-builder-open.puzzle-list-query-changed', query, userId: input.ctx.currentUserId },
          })
        }}
        onClick={(puzzle) =>
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'screen-puzzle-builder-open.clicked-puzzle-list-item', puzzle, userId: input.ctx.currentUserId },
          })
        }
        fab={<CreateNewPuzzleFrontend.ViewCreateFab {...input} />}
      />
    </div>
  )
}

export const ScreenPuzzleBuilderOpenFrontend = {
  update,
  View,
  subscriptions,
}
