import { pipe } from '~/@/function/pipe'
import { VariantGridShorthand, VariantGridBoard } from '../variant/grid'

const grid1 = pipe(
  VariantGridShorthand.init([
    ['B', 'a', 'a', 'A', 'D'],
    ['b', 'a', 'c', 'C', 'd'],
    ['b', 'a', 'C', 'd', 'd'],
    ['b', 'A', 'D', 'd', 'E'],
    ['b', 'B', 'E', 'e', 'e'],
  ]),
  VariantGridShorthand.toGrid,
)

const grid2 = pipe(
  VariantGridShorthand.init([
    ['d', 'd', 'd', 'A', 'a'],
    ['d', 'C', 'D', 'B', 'a'],
    ['d', 'c', 'C', 'b', 'a'],
    ['d', 'b', 'b', 'b', 'a'],
    ['D', 'B', 'A', 'a', 'a'],
  ]),
  VariantGridShorthand.toGrid,
)

const grid = false ? grid2 : grid1

const gridView = (
  <VariantGridBoard.View model={grid} disabled borderless disableHighlight className='aspect-square bg-black' />
)

export const CoverArt = (input: { className?: string }) => {
  return <div {...input}>{gridView}</div>
}
