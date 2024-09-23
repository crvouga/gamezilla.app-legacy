import { APP_SOUND, playSound } from 'gamezilla-app/app/@/client'
import { TopBar } from 'gamezilla-app/app/@/ui'
import { withId } from 'gamezilla-app/app/spaces/@/event'
import { FlowPack } from '../../@/flow-pack'
import { FlowPackPuzzlesGridUI } from '../../@/flow-pack/flow-pack-puzzles-grid/flow-pack-puzzles-grid-ui'
import { FlowPackPuzzlesGridClient } from '../../@/flow-pack/flow-pack-puzzles-grid/flow-pack-puzzles-grid.client'
import type { ClientModule } from '../play.types'

const update: ClientModule['update'] = (input) => {
  if (
    input.msgEvt?.t === 'space/synced' ||
    input.msgCore?.t === 'user-clicked-open-pack-list-item' ||
    input.msgCore?.t === 'user-clicked-exit-puzzle'
  ) {
    const pack: FlowPack | null = 'flowPack' in input.modelCore.screen ? input.modelCore.screen.flowPack : null

    if (!pack) {
      return {
        model: input.model
      }
    }

    return {
      model: input.model,
      msgCmd: [FlowPackPuzzlesGridClient.load(pack)]
    }
  }

  switch (input.msg?.t) {
    case 'user-clicked-exit-pack-button':
    case 'user-clicked-open-puzzle-grid-item': {
      return {
        model: input.model,
        msgCore: [withId(input.msg)]
      }
    }
  }

  switch (input.msgCore?.t) {
    case 'user-clicked-exit-pack-button': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)]
      }
    }
    case 'user-clicked-open-puzzle-grid-item': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)]
      }
    }
  }

  return {
    model: input.model
  }
}

const View: ClientModule['View'] = (input) => {
  if (input.modelCore.screen.t !== 'screen-select-puzzle') {
    return null
  }
  return (
    <div className='flex h-full w-full flex-1 flex-col'>
      <TopBar
        ctx={input.ctx}
        onBack={() =>
          input.dispatch({
            t: 'user-clicked-exit-pack-button'
          })
        }
        title={input.ctx.t('flow-pack-name', input.modelCore.screen.flowPack.name)}
      />
      <div className='flex flex-1 flex-col items-center justify-center'>
        <FlowPackPuzzlesGridUI.View
          id='pack-puzzle-grid'
          slideIndex={input.modelCore.screen.slideIndex}
          onSlideIndexChanged={(slideIndex) =>
            input.dispatch({
              t: 'user-changed-slides',
              slideIndex,
              userId: input.ctx.currentUserId
            })
          }
          puzzleIds={input.modelCore.screen.flowPack.puzzleIds}
          renderCell={(inputCell) => {
            if (!inputCell.puzzleId) {
              return <FlowPackPuzzlesGridUI.ViewEmptyCell />
            }

            const puzzle = input.ctx.flowPuzzles[inputCell.puzzleId]

            if (!puzzle) {
              if (FlowPackPuzzlesGridClient.isLoading(input.ctx.flowPackPuzzleGrid)) {
                return <FlowPackPuzzlesGridUI.ViewLoadingCell />
              }

              return (
                <FlowPackPuzzlesGridUI.ViewErrorCell
                  index={inputCell.index}
                  onClick={() =>
                    input.dispatch({
                      t: 'user-clicked-open-puzzle-grid-item',
                      flowPuzzle: {
                        t: 'not-found'
                      },
                      puzzleIndex: inputCell.index
                    })
                  }
                />
              )
            }

            return (
              <FlowPackPuzzlesGridUI.ViewPuzzleCell
                index={inputCell.index}
                onClick={() =>
                  input.dispatch({
                    t: 'user-clicked-open-puzzle-grid-item',
                    flowPuzzle: { t: 'got', c: puzzle },
                    puzzleIndex: inputCell.index
                  })
                }
              />
            )
          }}
        />
      </div>
    </div>
  )
}

export const ScreenSelectPuzzleClient = {
  update,
  View
}
