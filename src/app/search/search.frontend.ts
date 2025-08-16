import { matchSort } from '~/@/array/match-sort'
import { Eff } from '~/@/eff'
import { ClickableTransparent } from '~/@/ui/clickable'
import { IconMagnifyingGlass, IconXMark } from '~/@/ui/icon'
import { Paper } from '~/@/ui/paper'
import { sx } from '~/@/vdom/style/sx'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { Text } from '~/@/vdom/primitives/text'
import { TextInput } from '~/@/vdom/primitives/text-input'
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
    h(Box, { style: sx({ flexDirection: 'row', height: 'full', width: 'full' }) }, [
      // input
      h(Box, { style: sx({ width: 'full', padding: 4 }) }, [
        h(
          Paper,
          {
            style: sx({
              flexDirection: 'row',
              width: 'full',
              alignItems: 'center',
              gap: 2,
              rounded: 'full',
              padding: 4,
            }),
          },
          [
            h(IconMagnifyingGlass, { style: sx({ size: 6 }) }),
            h(TextInput, {
              id: searchInputId,
              style: sx({ flex: 1, fontSize: 'lg' }),
              placeholder: 'Search',
              defaultValue: model.searchText,
              onChangeText: (e: unknown) =>
                dispatch({
                  t: 'inputted-search-text',
                  // @ts-ignore
                  searchText: e.currentTarget.value,
                }),
            }),
            h(
              Pressable,
              {
                onPress: () =>
                  dispatch({
                    t: 'clicked-clear',
                  }),
              },
              [h(IconXMark, { style: sx({ size: 6 }) })],
            ),
          ],
        ),
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
                style: sx({ flexDirection: 'row', width: 'full', alignItems: 'center', gap: 4, padding: 4 }),
                onPress: () =>
                  dispatch({
                    t: 'clicked-result',
                    userId: result.userId,
                  }),
              },
              [h(Text, { text: result.username })],
            ),
          ]),
        ),
      ),
    ]),
    viewBottomBar,
  ])
}
