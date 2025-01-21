import { APP_SOUND, playSound, showToast } from '~/app/@/frontend/cmd'
import { TopBar } from '~/app/@/ui'
import { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { PuzzleDbQueryFrontend } from '../../../@/puzzle/puzzle-db-query/frontend'
import { PuzzleDbQuery } from '../../../@/puzzle/puzzle-db/query'
import type { FrontendModule } from '../../types'
import { ScreenPackBuilderSpace } from '../space'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.user-clicked-add-puzzle-item': {
      const { msgSpace } = input
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.refreshFeed), showToast(input.ctx.t('flow.puzzle-added'))],
        async eff(dispatch) {
          const modelSpace = ScreenPackBuilderSpace.update({ ...input, msgSpace })

          if (!modelSpace.screenPackBuilder) return

          const saved = await input.ctx.packDb.put(modelSpace.screenPackBuilder.pack)

          dispatch({ t: 'got-msg-space', c: { t: 'screen-pack-builder.saved-pack', saved } })
        },
      }
    }

    case 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navForwardMin)] }
    }

    case 'screen-pack-builder.user-closed-add-puzzle-screen': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }
    }
  }

  return { model: input.model }
}

const toQuery = (input: { ctx: FlowFrontendCtx }): PuzzleDbQuery => {
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
  return PuzzleDbQueryFrontend.watch(input.ctx, toQuery(input), (c) => ({ t: 'got-puzzle-db-query-msg', c }))
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
      <PuzzleDbQueryFrontend.View
        ctx={input.ctx}
        model={input.ctx.puzzleDbQuery}
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
  )
}

export const ScreenAddPuzzle = {
  update,
  subscriptions,
  View,
}
