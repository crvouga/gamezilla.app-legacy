import { IconPen } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { PackPuzzleGridUI } from '../../../../@/pack/pack-puzzle-grid-ui'
import { ScreenPackBuildSpace } from '../space/space'
import type { FrontendModule } from '../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.user-clicked-pack-item': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)] }
    }

    case 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)] }
    }
  }
  return { model: input.model }
}

const View: FrontendModule['View'] = (input) => {
  const packBuilder = input.modelSpace
  if (!packBuilder) return null

  return h(ScreenLayout, {
    parentScreen: input.ctx.parentScreen,
    id: 'screen-puzzle-grid',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('numberlink-pack-name', packBuilder.pack.name),
      back: {
        onClick: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.user-clicked-back-button',
              userId: input.ctx.currentUser.userId,
            },
          }),
      },
    },
    renderBody: () =>
      h(PackPuzzleGridUI.View, {
        id: packBuilder.pack.id,
        currentSlideIndex: ScreenPackBuildSpace.toSlideIndex(packBuilder),
        puzzleIds: packBuilder.pack.puzzleIds,
        onSlideIndexChanged: (newSlideIndex) => {
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'screen-pack-builder.user-changed-slide', newSlideIndex, userId: input.ctx.currentUser.userId },
          })
        },
        onClickPuzzleCell: ({ puzzleIndex, puzzleId }) => {
          const puzzle = input.ctx.puzzles[puzzleId]
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.user-clicked-pack-item',
              puzzleIndex,
              puzzleResult: puzzle ? { t: 'got', c: puzzle } : { t: 'not-found' },
            },
          })
        },
        addCell: {
          include: true,
          onClick: () => {
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
                userId: input.ctx.currentUser.userId,
              },
            })
          },
        },
      }),
    actionBar: {
      variant: {
        t: 'uniform',
        actions: [
          {
            id: input.ctx.t('app.edit-name'),
            icon: (input) => h(IconPen, input),
            label: input.ctx.t('app.edit-name'),
            onClick: () => {
              input.dispatch({
                t: 'got-msg-space',
                c: {
                  t: 'edit-pack-name.user-clicked-open-drawer-button',
                  userId: input.ctx.currentUser.userId,
                },
              })
            },
          },
        ],
      },
    },
  })
}

export const ScreenPuzzleGrid = {
  update,
  View,
}
