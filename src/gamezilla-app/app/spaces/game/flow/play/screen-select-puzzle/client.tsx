import { APP_SOUND, playSound } from 'gamezilla-app/app/@/client'
import { TopBar } from 'gamezilla-app/app/@/ui'
import { withEventId } from 'gamezilla-app/app/spaces/@/event'
import { FlowPack } from '../../@/pack/pack'
import { FlowPackPuzzlesGridUI } from '../../@/pack/pack-puzzles-grid/pack-puzzles-grid-ui'
import { FlowPackPuzzlesGridClient } from '../../@/pack/pack-puzzles-grid/pack-puzzles-grid.client'
import type { ClientModule } from '../types'
import { andThen } from '../../../@/architecture/game-client-v2'

const update: ClientModule['update'] = (input) => {
  return andThen(
    { model: input.model },
    (model) => updateMain({ ...input, model }),
    (model) => updateLoadPuzzles({ ...input, model }),
    (model) => updateFromMsg({ ...input, model })
  )
}

const updateLoadPuzzles: typeof update = (input) => {
  if (
    input.msgEvt?.t === 'space/synced' ||
    input.msgCore?.t === 'user-clicked-open-pack-list-item' ||
    input.msgCore?.t === 'user-clicked-exit-puzzle'
  ) {
    const pack: FlowPack | null = 'flowPack' in input.modelCore.screen ? input.modelCore.screen.flowPack : null

    if (!pack) {
      return { model: input.model }
    }

    return {
      model: input.model,
      msgCmd: [FlowPackPuzzlesGridClient.load(pack)]
    }
  }

  return {
    model: input.model
  }
}

const updateFromMsg: typeof update = (input) => {
  switch (input.msg?.t) {
    case 'user-clicked-exit-pack-button':
    case 'user-clicked-open-puzzle-grid-item': {
      return {
        model: input.model,
        msgCore: [withEventId(input.msg)]
      }
    }
  }

  return {
    model: input.model
  }
}

const updateMain: typeof update = (input) => {
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
  const flowPack = input.modelCore.screen.flowPack
  return (
    <div className='flex h-full w-full flex-1 flex-col'>
      <TopBar
        ctx={input.ctx}
        onBack={() =>
          input.dispatch({
            t: 'user-clicked-exit-pack-button'
          })
        }
        title={input.ctx.t('flow-pack-name', flowPack.name)}
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
          puzzleIds={flowPack.puzzleIds}
          renderCell={(inputCell) => {
            if (!inputCell.puzzleId) {
              return <FlowPackPuzzlesGridUI.ViewEmptyCell />
            }

            if (FlowPackPuzzlesGridClient.showLoading(input.ctx.packPuzzleGrid, flowPack.puzzleIds)) {
              return <FlowPackPuzzlesGridUI.ViewLoadingCell />
            }

            const puzzle = input.ctx.puzzles[inputCell.puzzleId]

            if (!puzzle) {
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
