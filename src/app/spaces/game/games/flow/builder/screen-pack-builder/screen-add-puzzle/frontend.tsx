import { APP_SOUND, playSound, showToast } from '~/app/@/frontend/cmd'
import { TopBar } from '~/app/@/ui'
import { FormBottomButtons } from '~/app/@/ui/form-button-buttons'
import { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { PuzzleDbQueryFrontend } from '../../../@/puzzle/puzzle-db-query/frontend'
import { PuzzleDbQuery } from '../../../@/puzzle/puzzle-db/query'
import { ScreenPackBuilderSpace } from '../space'
import type { FrontendModule, ModelSpace } from '../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle': {
      const { msgSpace } = input
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.refreshFeed), showToast(input.ctx.t('flow.puzzle-added'))],
        async eff(dispatch) {
          const modelSpace = ScreenPackBuilderSpace.updateSpace({
            ...input,
            msgSpace,
          })

          const saved = await input.ctx.packDb.put(modelSpace.pack)

          dispatch({ t: 'got-msg-space', c: { t: 'screen-pack-builder.saved-pack', saved } })
        },
      }
    }

    case 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navForwardMin)] }
    }

    case 'screen-pack-builder.screen-add-puzzle.user-clicked-close': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }
    }
  }

  return { model: input.model }
}

const toQuery = (input: { ctx: FlowFrontendCtx; modelSpace: ModelSpace }): PuzzleDbQuery => {
  return (
    input.modelSpace?.screenAddPuzzlePuzzleDbQuery ?? {
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
  )
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
          input.dispatch({ t: 'got-msg-space', c: { t: 'screen-pack-builder.screen-add-puzzle.user-clicked-close' } })
        }
      />
      <PuzzleDbQueryFrontend.ViewList
        selectable
        ctx={input.ctx}
        model={input.ctx.puzzleDbQuery}
        query={query}
        onQueryChanged={(query) => {
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.screen-add-puzzle.puzzle-db-query-query-changed',
              query,
              userId: input.ctx.currentUserId,
            },
          })
        }}
        onItemClick={(puzzle) => {
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle',
              puzzle,
              userId: input.ctx.currentUserId,
            },
          })
        }}
      />
      <FormBottomButtons
        cancelText={input.ctx.t('app.cancel')}
        confirmText={input.ctx.t('app.add')}
        onCancel={() =>
          input.dispatch({ t: 'got-msg-space', c: { t: 'screen-pack-builder.screen-add-puzzle.user-clicked-close' } })
        }
        cancelDisabled={false}
        confirmLoading={false}
      />
    </div>
  )
}

export const ScreenAddPuzzle = {
  update,
  subscriptions,
  View,
}
