import { IconGamepad } from '~/@/ui'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ScreenLayoutHostSettingUpGame } from '../../../@/ui/screen-layout-host-setting-up-game/screen-layout-host-setting-up-game'
import { PackPuzzleGridUI } from '../../@/pack/pack-puzzle-grid-ui'
import { PuzzleDbQueryFrontend } from '../../@/puzzle/puzzle-db-query/frontend'
import { PuzzleDbQuery } from '../../@/puzzle/puzzle-db/query'
import type { FrontendModule, ModelSpace } from '../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-clicked-exit-screen-open-pack': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      }
    }

    case 'user-clicked-open-screen-play-puzzle': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }
  }

  return { model: input.model }
}

const toQuery = (input: { modelSpace: ModelSpace }): PuzzleDbQuery | null => {
  if (input.modelSpace.screen.t !== 'screen-select-puzzle') {
    return null
  }
  return {
    order: {},
    pagination: { limit: 25, offset: 0 },
    where: {
      puzzleId: {
        in: input.modelSpace.screen.pack.puzzleIds,
      },
    },
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return PuzzleDbQueryFrontend.watch(input.ctx, toQuery(input), (c) => ({ t: 'got-puzzle-db-query-msg', c }))
}

const View: FrontendModule['View'] = (input) => {
  if (input.modelSpace.screen.t !== 'screen-select-puzzle') {
    return null
  }

  const pack = input.modelSpace.screen.pack
  const isSpectating = input.ctx.currentUserId !== input.ctx.space.hostId

  if (isSpectating) {
    return (
      <ScreenLayoutHostSettingUpGame
        parentScreen={input.ctx.parentScreen}
        ctx={input.ctx}
        navBar={{
          title: input.ctx.t('flow.play'),
        }}
        renderCoverArt={(input) => <IconGamepad {...input} />}
      />
    )
  }

  const screen = input.modelSpace.screen

  return (
    <ScreenLayout
      parentScreen={input.ctx.parentScreen}
      ctx={input.ctx}
      id='screen-open-puzzle'
      navBar={{
        title: input.ctx.t('flow-pack-name', pack.name),
        onBack: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'user-clicked-exit-screen-open-pack', userId: input.ctx.currentUserId },
          }),
      }}
      renderBody={() => (
        <PackPuzzleGridUI.View
          id='pack-puzzle-grid'
          slideIndex={screen.slideIndex}
          onSlideIndexChanged={(slideIndex) =>
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'user-changed-slides',
                slideIndex,
                userId: input.ctx.currentUserId,
              },
            })
          }
          puzzleIds={pack.puzzleIds}
          onClickPuzzleCell={({ puzzleIndex, puzzleId }) => {
            const puzzle = input.ctx.puzzles[puzzleId]
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'user-clicked-open-screen-play-puzzle',
                puzzle: puzzle ? { t: 'got', c: puzzle } : { t: 'not-found' },
                puzzleIndex,
                userId: input.ctx.currentUserId,
              },
            })
          }}
        />
      )}
    />
  )
}

export const ScreenOpenPuzzleFrontend = {
  update,
  subscriptions,
  View,
}
