import { matchSort } from '~/@/array/match-sort'
import { Eff } from '~/@/eff'
import { ClickableTransparent } from '~/@/ui/clickable'
import { IconMagnifyingGlass, IconXMark } from '~/@/ui/icon'
import { Paper } from '~/@/ui/paper'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { TextInput } from '~/@/vdom/primitives/text-input'
import { Pressable } from '~/@/vdom/primitives/pressable'
import type { VDom } from '~/@/vdom/vdom'
import type { ModelFrontend, MsgFrontend, MsgToFrontend } from './search.types'
import { Text } from '~/@/vdom/primitives/text'

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
  if (msg.t === 'clicked-clear') {
    return {
      model: {
        ...model,
        searchText: '',
      },
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

  return h(Box, {}, [
    h(Box, { class: 'flex flex-row h-full w-full flex-col' }, [
      // input
      h(Box, { class: 'w-full p-4' }, [
        h(Paper, { class: 'flex flex-row w-full items-center gap-2 rounded-full px-4 py-2' }, [
          h(IconMagnifyingGlass, { class: 'size-6' }),
          h(TextInput, {
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
          h(
            Pressable,
            {
              type: 'button',
              onPressDown: () =>
                dispatch({
                  t: 'clicked-clear',
                }),
            },
            [h(IconXMark, { class: 'size-6' })],
          ),
        ]),
      ]),
      // results
      h(
        Box,
        {},
        results.map((result) =>
          h(Box, { key: result.userId }, [
            h(
              ClickableTransparent,
              {
                class: 'flex flex-row w-full items-center gap-4 p-4',
                onPressDown: () =>
                  dispatch({
                    t: 'clicked-result',
                    userId: result.userId,
                  }),
              },
              [Text({ text: result.username })],
            ),
          ]),
        ),
      ),
    ]),
    viewBottomBar,
  ])
}
