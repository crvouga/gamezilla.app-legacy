import { Sub } from '~/@/sub'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { TopBar } from '~/app/@/ui'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { FlowFrontendCtx } from '../../@/frontend/ctx'
import { QueryPuzzlesInput } from '../../@/puzzle/puzzle-db/query'
import { PuzzleListFrontend } from '../../@/puzzle/puzzle-list/frontend'
import type { FrontendModule } from '../types'
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
  }

  switch (input.msg?.t) {
    case 'got-puzzle-list-msg': {
      return { model: input.model, msgCmd: [PuzzleListFrontend.gotMsg(input.msg.c)] }
    }
  }

  return { model: input.model }
}

const toPuzzleQuery = (input: { ctx: FlowFrontendCtx }): QueryPuzzlesInput => {
  return {
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
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return Sub.batch([
    PuzzleListFrontend.watch(input.ctx, toPuzzleQuery(input), (c) => ({ t: 'got-puzzle-list-msg', c })),
  ])
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
