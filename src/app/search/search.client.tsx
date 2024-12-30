import { matchSort } from '~/@/array/match-sort'
import { Browser } from '~/@/browser'
import { Eff } from '~/@/eff'
import { pipe } from '~/@/function/pipe'
import type { VDom } from '~/@/vdom'
import { IconMagnifyingGlass, IconXMark } from '~/app/@/ui'
import { AppClientCmd, sendToServer } from '../@/client/client-cmd'
import { ClientEvt } from '../@/client/client-event'
import type { ModelClient, MsgClient, MsgToClient, MsgToServer } from './search.types'

//
//
//
// Model
//
//
//

export const init = ({
  stored
}: {
  stored: ModelClient | null
}): {
  model: ModelClient
} => {
  if (stored) {
    return {
      model: stored
    }
  }
  return {
    model: {
      searchText: '',
      searchResults: {},
      requests: {}
    }
  }
}

//
//
//
// Update
//
//
//

export type Msg = MsgClient

const searchInputId = 'search-input'

export const update = ({
  msg,
  model
}: {
  msg: Msg
  model: ModelClient
}): {
  model: ModelClient
  eff?: Eff<Msg>
  msgEvt?: ClientEvt[]
  msgCmd?: AppClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>[]
} => {
  if (msg.t === 'focus-done') {
    return { model }
  }

  if (msg.t === 'clicked-clear') {
    return {
      model: {
        ...model,
        searchText: ''
      },
      eff: pipe(
        Browser.focus(searchInputId),
        Eff.perform((result) => ({
          t: 'focus-done',
          result
        }))
      )
    }
  }

  if (msg.t === 'inputted-search-text') {
    return {
      model: {
        ...model,
        searchText: msg.searchText
      }
    }
  }

  if (msg.t === 'clicked-result') {
    return { model }
  }

  return { model, msgCmd: [sendToServer(msg)] }
}

export const updateFromServer = ({
  model
}: {
  msg: MsgToClient
  model: ModelClient
}): { model: ModelClient; eff?: Eff<Msg> } => {
  return { model }
}

//
//
//
// View
//
//
//

export const View = ({
  model,
  dispatch,
  viewBottomBar
}: {
  model: ModelClient
  dispatch: (msg: Msg) => void
  viewBottomBar: VDom
}) => {
  //   const request = model.requests[model.searchText] ?? { type: 'not-asked' };
  const results = matchSort(Object.values(model.searchResults), (item) => item.username, model.searchText)

  return (
    <>
      <div className='flex h-full w-full flex-col'>
        {/* input */}
        <div className='w-full p-4'>
          <div className='bg-paper flex w-full items-center gap-2 rounded-full px-4 py-2'>
            <IconMagnifyingGlass className='h-6 w-6' />
            <input
              id={searchInputId}
              className='flex-1 bg-transparent text-lg outline-none'
              placeholder='Search'
              value={model.searchText}
              onChange={(msgEvt) =>
                dispatch({
                  t: 'inputted-search-text',
                  searchText: msgEvt.currentTarget.value
                })
              }
            />
            <button
              type='button'
              onClick={() =>
                dispatch({
                  t: 'clicked-clear'
                })
              }
            >
              <IconXMark className='h-6 w-6' />
            </button>
          </div>
        </div>
        {/* results */}
        <ul>
          {results.map((result) => (
            <li key={result.userId}>
              <button
                type='button'
                className='hover:bg-paper flex w-full items-center gap-4 p-4'
                onClick={() =>
                  dispatch({
                    t: 'clicked-result',
                    userId: result.userId
                  })
                }
              >
                {result.username}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {viewBottomBar}
    </>
  )
}
