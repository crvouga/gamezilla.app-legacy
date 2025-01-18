import { APP_SOUND, playSound, showToast } from '~/app/@/frontend/cmd'
import { TopBar } from '~/app/@/ui'
import { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { QueryPuzzlesInput } from '../../../@/puzzle/puzzle-db/query'
import { PuzzleListFrontend } from '../../../@/puzzle/puzzle-list/frontend'
import type { FrontendModule } from '../../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.user-clicked-add-puzzle-item': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.refreshFeed), showToast(input.ctx.t('flow.puzzle-added'))],
      }
    }

    case 'screen-pack-builder.user-closed-add-puzzle-screen': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }
    }
  }

  switch (input.msg?.t) {
    case 'got-puzzle-list-msg': {
      return { model: input.model, msgCmd: [PuzzleListFrontend.gotMsg(input.msg.c)] }
    }
  }

  return { model: input.model }
}

const toQuery = (input: { ctx: FlowFrontendCtx }): QueryPuzzlesInput => {
  return {
    order: {
      createdAt: 'asc',
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
  return PuzzleListFrontend.watch(input.ctx, toQuery(input), (c) => ({ t: 'got-puzzle-list-msg', c }))
}

const View: FrontendModule['View'] = (input) => {
  const query = toQuery(input)

  return (
    <div className='flex h-full max-h-full w-full flex-col overflow-hidden'>
      <TopBar
        ctx={input.ctx}
        title={input.ctx.t('flow.add-puzzle')}
        onBack={() =>
          input.dispatch({ t: 'got-msg-space', c: { t: 'screen-pack-builder.user-closed-add-puzzle-screen' } })
        }
      />
      <div className='h-full max-h-full w-full max-w-full flex-1 overflow-hidden overflow-y-scroll'>
        <PuzzleListFrontend.View
          ctx={input.ctx}
          model={input.ctx.puzzleList}
          query={query}
          onQueryChanged={(query) => {
            console.log('onQueryChanged,', query)
          }}
          onClick={(puzzle) =>
            input.dispatch({
              t: 'got-msg-space',
              c: { t: 'screen-pack-builder.user-clicked-add-puzzle-item', puzzle, userId: input.ctx.currentUserId },
            })
          }
        />
      </div>
    </div>
  )
}

export const ScreenAddPuzzle = {
  update,
  subscriptions,
  View,
}
