import { pipe } from '~/@/function/pipe'
import { h } from '~/@/vdom/h'
import { VariantGridBoard, VariantGridShorthand } from '../variant/grid'

const init = (x: VariantGridShorthand.Model) => pipe(VariantGridShorthand.init(x), VariantGridShorthand.toGrid)

const GRIDS = [
  init([
    ['B', 'a', 'a', 'A', 'D'],
    ['b', 'a', 'c', 'C', 'd'],
    ['b', 'a', 'C', 'd', 'd'],
    ['b', 'A', 'D', 'd', 'E'],
    ['b', 'B', 'E', 'e', 'e'],
  ]),
  init([
    ['d', 'd', 'd', 'A', 'a'],
    ['d', 'C', 'D', 'B', 'a'],
    ['d', 'c', 'C', 'b', 'a'],
    ['d', 'b', 'b', 'b', 'a'],
    ['D', 'B', 'A', 'a', 'a'],
  ]),
  init([
    ['C', 'Aa', 'A'],
    ['c', 'B', 'b'],
    ['c', 'C', 'B'],
  ]),
  init([
    ['B', 'b', 'D', 'd', 'E'],
    ['A', 'b', 'E', 'd', 'e'],
    ['a', 'B', 'e', 'D', 'e'],
    ['a', 'C', 'e', 'e', 'e'],
    ['A', 'c', 'c', 'c', 'C'],
  ]),
] as const

const GRID = GRIDS[3]

export const CoverArt = (input: { class?: string }) => {
  return h('div', { class: input.class }, [
    h(VariantGridBoard.View, {
      model: GRID,
      disabled: true,
      borderless: true,
      disableHighlight: true,
      class: 'aspect-square bg-black',
    }),
  ])
}
