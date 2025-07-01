import { matchSort } from '~/@/array/match-sort'
import { Browser } from '~/@/browser'
import { Eff } from '~/@/eff'
import { pipe } from '~/@/function/pipe'
import { ClickableTransparent } from '~/@/ui/clickable'
import { IconMagnifyingGlass, IconXMark } from '~/@/ui/icon'
import { Paper } from '~/@/ui/paper'
import { v } from '~/@/vdom/v'
import type { VDom } from '~/@/vdom/vdom'
import type { ModelFrontend, MsgFrontend, MsgToFrontend } from './search.types'

//
//
//
// Model
//
//
//

export const init = ({
  stored,
}: {
  stored: ModelFrontend | null
}): {
  model: ModelFrontend
} => {
  if (stored) {
    return {
      model: stored,
    }
  }
  return {
    model: {
      searchText: '',
      searchResults: {},
      requests: {},
    },
  }
}

//
//
//
// Update
//
//
//

export type Msg = MsgFrontend

const searchInputId = 'search-input'

export const update = ({
  msg,
  model,
}: {
  msg: Msg
  model: ModelFrontend
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  if (msg.t === 'focus-done') {
    return { model }
  }

  if (msg.t === 'clicked-clear') {
    return {
      model: {
        ...model,
        searchText: '',
      },
      eff: pipe(
        Browser.focus(searchInputId),
        Eff.perform((result) => ({
          t: 'focus-done',
          result,
        })),
      ),
    }
  }

  if (msg.t === 'inputted-search-text') {
    return {
      model: {
        ...model,
        searchText: msg.searchText,
      },
    }
  }

  if (msg.t === 'clicked-result') {
    return { model }
  }

  return { model }
}

export const updateFromBackend = ({
  model,
}: {
  msg: MsgToFrontend
  model: ModelFrontend
}): { model: ModelFrontend; eff?: Eff<Msg> } => {
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
  viewBottomBar,
}: {
  model: ModelFrontend
  dispatch: (msg: Msg) => void
  viewBottomBar: VDom
}) => {
  //   const request = model.requests[model.searchText] ?? { type: 'not-asked' };
  const results = matchSort(Object.values(model.searchResults), (item) => item.username, model.searchText)

  return v('div', null, [
    v('div', { class: 'flex h-full w-full flex-col' }, [
      // input
      v('div', { class: 'w-full p-4' }, [
        v(Paper, { class: 'flex w-full items-center gap-2 rounded-full px-4 py-2' }, [
          v(IconMagnifyingGlass, { class: 'size-6' }),
          v('input', {
            id: searchInputId,
            class: 'flex-1 bg-transparent text-lg outline-none',
            placeholder: 'Search',
            value: model.searchText,
            onChange: (msgEvt: unknown) =>
              dispatch({
                t: 'inputted-search-text',
                // @ts-ignore
                searchText: msgEvt.currentTarget.value,
              }),
          }),
          v(
            'button',
            {
              type: 'button',
              onClick: () =>
                dispatch({
                  t: 'clicked-clear',
                }),
            },
            [v(IconXMark, { class: 'size-6' })],
          ),
        ]),
      ]),
      // results
      v(
        'ul',
        null,
        results.map((result) =>
          v('li', { key: result.userId }, [
            v(
              ClickableTransparent,
              {
                class: 'flex w-full items-center gap-4 p-4',
                onClick: () =>
                  dispatch({
                    t: 'clicked-result',
                    userId: result.userId,
                  }),
              },
              [result.username],
            ),
          ]),
        ),
      ),
    ]),
    viewBottomBar,
  ])
}
