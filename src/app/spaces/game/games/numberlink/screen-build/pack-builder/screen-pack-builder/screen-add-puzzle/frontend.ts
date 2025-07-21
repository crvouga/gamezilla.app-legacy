import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { FlowFrontendCtx } from '../../../../@/frontend/ctx'
import { PuzzleQuery } from '../../../../@/puzzle/puzzle-db/interface-query'
import { PuzzleLoaderFrontend } from '../../../../@/puzzle/puzzle-loader/frontend'
import { GotPuzzleLoaderMsg } from '../../../../@/puzzle/puzzle-loader/got-puzzle-loader-msg.$msg'
import { ScreenPackBuildSpace } from '../space/space'
import type { FrontendModule, ModelSpace, MsgFrontend } from '../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form': {
      const { msgSpace } = input
      return {
        model: input.model,
        msgOut: [
          PlaySoundCmd.init(APP_SOUND.refreshFeed),
          ShowToastCmd.init(input.ctx.t('game.numberlink.puzzle-added')),
        ],
        async eff(dispatch) {
          const modelSpace = ScreenPackBuildSpace.updateSpace({ ...input, msgSpace })

          const saved = await input.ctx.packDb.put(modelSpace.pack)

          dispatch({ t: 'got-msg-space', c: { t: 'screen-pack-builder.saved-pack', saved } })
        },
      }
    }

    case 'screen-pack-builder.screen-add-puzzle.user-clicked-close': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin)] }
    }

    case 'screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }

    case 'screen-pack-builder.screen-add-puzzle.puzzle-db-query-query-changed': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }

    case 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }
  }

  return { model: input.model }
}

const toQuery = (input: { ctx: FlowFrontendCtx; modelSpace: ModelSpace }): PuzzleQuery => {
  return (
    input.modelSpace?.screenAddPuzzle_puzzleQuery ?? {
      order: {
        createdAt: 'asc',
      },
      pagination: {
        offset: 0,
        limit: 10,
      },
      where: {
        createdBy: {
          equals: input.ctx.currentUser.userId,
        },
      },
    }
  )
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  // PuzzleDbQueryCache.sub(input.ctx.puzzleDb, toQuery(input), (c) => ({ t: 'got-msg-out', c }))

  return PuzzleLoaderFrontend.watch(
    input.ctx,
    toQuery(input),
    (c): MsgFrontend => ({ t: 'got-msg-out', c: GotPuzzleLoaderMsg.init(c) }),
  )
}

const View: FrontendModule['View'] = (input) => {
  const query = toQuery(input)

  return h(ScreenLayout, {
    parentScreen: input.ctx.parentScreen,
    id: 'screen-pack-builder-add-puzzle',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('game.numberlink.add-puzzle'),
      back: {
        onClick: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.screen-add-puzzle.user-clicked-close',
              userId: input.ctx.currentUser.userId,
            },
          }),
      },
    },
    patchAction: {
      onSubmit: () => {
        input.dispatch({
          t: 'got-msg-space',
          c: {
            t: 'screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form',
            userId: input.ctx.currentUser.userId,
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
            userId: input.ctx.currentUser.userId,
          },
        }),
      cancelDisabled: false,
      submitLoading: false,
      submitDisabled: input.modelSpace.screenAddPuzzle_selected.length === 0,
    },
    renderBody: () =>
      h(PuzzleLoaderFrontend.ViewList, {
        selectable: true,
        ctx: input.ctx,
        model: input.ctx.puzzleLoader,
        selected: input.modelSpace.screenAddPuzzle_selected,
        query: query,
        onHeaderCheckboxClick: (allPuzzleIds) => {
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox',
              puzzleIds: allPuzzleIds,
              userId: input.ctx.currentUser.userId,
            },
          })
        },
        onQueryChanged: (query) => {
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.screen-add-puzzle.puzzle-db-query-query-changed',
              query,
              userId: input.ctx.currentUser.userId,
            },
          })
        },
        onItemClick: (puzzle) => {
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item',
              puzzleId: puzzle.id,
              userId: input.ctx.currentUser.userId,
            },
          })
        },
      }),
  })
}

export const ScreenAddPuzzle = {
  update,
  subscriptions,
  View,
}
