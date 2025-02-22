import { IconPen } from '~/@/ui'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { PackPuzzleGridUI } from '../../../../@/pack/pack-puzzle-grid-ui'
import { ScreenPackBuildSpace } from '../space/space'
import type { FrontendModule } from '../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.user-clicked-pack-item': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navForwardMin)] }
    }

    case 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button': {
      return { model: input.model, msgCmd: [playSound(APP_SOUND.navForwardMin)] }
    }
  }
  return { model: input.model }
}

const View: FrontendModule['View'] = (input) => {
  const packBuilder = input.modelSpace
  if (!packBuilder) return null

  return (
    <ScreenLayout
      parentScreen={input.ctx.parentScreen}
      id='screen-puzzle-grid'
      ctx={input.ctx}
      navBar={{
        title: input.ctx.t('flow-pack-name', packBuilder.pack.name),
        onBack: () =>
          input.dispatch({
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.user-clicked-back-button',
              userId: input.ctx.currentUserId,
            },
          }),
      }}
      renderBody={() => (
        <PackPuzzleGridUI.View
          id={packBuilder.pack.id}
          slideIndex={ScreenPackBuildSpace.toSlideIndex(packBuilder)}
          puzzleIds={packBuilder.pack.puzzleIds}
          onSlideIndexChanged={(newSlideIndex) => {
            input.dispatch({
              t: 'got-msg-space',
              c: { t: 'screen-pack-builder.user-changed-slide', newSlideIndex, userId: input.ctx.currentUserId },
            })
          }}
          onClickPuzzleCell={({ puzzleIndex, puzzleId }) => {
            const puzzle = input.ctx.puzzles[puzzleId]
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'screen-pack-builder.user-clicked-pack-item',
                puzzleIndex,
                puzzleResult: puzzle ? { t: 'got', c: puzzle } : { t: 'not-found' },
              },
            })
          }}
          addCell={{
            include: true,
            onClick: () => {
              input.dispatch({
                t: 'got-msg-space',
                c: {
                  t: 'screen-puzzle-grid.user-clicked-open-add-puzzle-screen-button',
                  userId: input.ctx.currentUserId,
                },
              })
            },
          }}
        />
      )}
      actionBar={{
        variant: {
          t: 'uniform',
          actions: [
            {
              icon: (input) => <IconPen {...input} />,
              label: input.ctx.t('app.edit-name'),
              onClick: () => {
                input.dispatch({
                  t: 'got-msg-space',
                  c: {
                    t: 'edit-pack-name.user-clicked-open-drawer-button',
                    userId: input.ctx.currentUserId,
                  },
                })
              },
            },
          ],
        },
      }}
    />
  )
}

export const ScreenPuzzleGrid = {
  update,
  View,
}
