import { APP_SOUND, playSound, showToast } from '~/app/@/frontend/cmd'
import { ScreenLayout } from '~/app/@/ui/screen-layout'
import { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { PuzzleDbQueryFrontend } from '../../../@/puzzle/puzzle-db-query/frontend'
import { PuzzleDbQuery } from '../../../@/puzzle/puzzle-db/query'
import { ScreenPackBuildSpace } from '../space/space'
import type { FrontendModule, ModelSpace } from '../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form': {
      const { msgSpace } = input
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.refreshFeed), showToast(input.ctx.t('flow.puzzle-added'))],
        async eff(dispatch) {
          const modelSpace = ScreenPackBuildSpace.updateSpace({ ...input, msgSpace })

          const saved = await input.ctx.packDb.put(modelSpace.pack)

          dispatch({ t: 'got-msg-space', c: { t: 'screen-pack-builder.saved-pack', saved } })
        },
      }
    }

    case 'screen-pack-builder.screen-add-puzzle.user-clicked-close': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navBackwardMin)] }
    }

    case 'screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.tap)] }
    }

    case 'screen-pack-builder.screen-add-puzzle.puzzle-db-query-query-changed': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.tap)] }
    }

    case 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.tap)] }
    }
  }

  return { model: input.model }
}

const toQuery = (input: { ctx: FlowFrontendCtx; modelSpace: ModelSpace }): PuzzleDbQuery => {
  return (
    input.modelSpace?.screenAddPuzzle_puzzleDbQuery ?? {
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
    <ScreenLayout
      id='screen-pack-builder-add-puzzle'
      ctx={input.ctx}
      topBar={{
        title: input.ctx.t('flow.add-puzzle'),
        onBack: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.screen-add-puzzle.user-clicked-close',
              userId: input.ctx.currentUserId,
            },
          }),
      }}
      form={{
        onSubmit: () => {
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form',
              userId: input.ctx.currentUserId,
            },
          })
        },
        cancelText: input.ctx.t('app.cancel'),
        submitText: input.ctx.t('app.add'),
        onCancel: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.screen-add-puzzle.user-clicked-close',
              userId: input.ctx.currentUserId,
            },
          }),
        cancelDisabled: false,
        submitLoading: false,
        submitDisabled: input.modelSpace.screenAddPuzzle_selected.length === 0,
      }}
      renderBody={() => (
        <PuzzleDbQueryFrontend.ViewList
          selectable
          ctx={input.ctx}
          model={input.ctx.puzzleDbQuery}
          selected={input.modelSpace.screenAddPuzzle_selected}
          query={query}
          onHeaderCheckboxClick={(allPuzzleIds) => {
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox',
                puzzleIds: allPuzzleIds,
                userId: input.ctx.currentUserId,
              },
            })
          }}
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
                t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
                puzzleId: puzzle.id,
                userId: input.ctx.currentUserId,
              },
            })
          }}
        />
      )}
    />
  )
}

export const ScreenAddPuzzle = {
  update,
  subscriptions,
  View,
}
