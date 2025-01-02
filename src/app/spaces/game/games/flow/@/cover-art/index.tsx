import { pipe } from '~/@/function/pipe'
import { FlowGridShorthand, FlowGridBoard } from '../flow/flow-variant/flow-grid'

const grid1 = pipe(
  FlowGridShorthand.init([
    ['B', 'a', 'a', 'A', 'D'],
    ['b', 'a', 'c', 'C', 'd'],
    ['b', 'a', 'C', 'd', 'd'],
    ['b', 'A', 'D', 'd', 'E'],
    ['b', 'B', 'E', 'e', 'e']
  ]),
  FlowGridShorthand.toGrid
)

const grid2 = pipe(
  FlowGridShorthand.init([
    ['d', 'd', 'd', 'A', 'a'],
    ['d', 'C', 'D', 'B', 'a'],
    ['d', 'c', 'C', 'b', 'a'],
    ['d', 'b', 'b', 'b', 'a'],
    ['D', 'B', 'A', 'a', 'a']
  ]),
  FlowGridShorthand.toGrid
)

const grid = false ? grid2 : grid1

const gridView = (
  <FlowGridBoard.View model={grid} disabled borderless disableHighlight className='aspect-square bg-black' />
)

export const CoverArt = (input: { className?: string }) => {
  return <div {...input}>{gridView}</div>
}
