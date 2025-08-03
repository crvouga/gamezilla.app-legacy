import { h } from '~/@/vdom/h'
import { G } from '~/@/vdom/primitives/svg/g'
import { Path } from '~/@/vdom/primitives/svg/path'
import { Svg } from '~/@/vdom/primitives/svg/svg'

export const toChecker = ({ x, y }: { x: number; y: number }): 'Light' | 'Dark' => {
  if ((isEven(x) && isOdd(y)) || (isOdd(x) && isEven(y))) {
    return 'Light'
  }
  return 'Dark'
}
const isEven = (x: number) => x % 2 === 0
const isOdd = (x: number) => !isEven(x)

export const PawnIcon = (input: { stroke?: string }) => {
  return h(
    G,
    {
      transform: 'translate(0 -2) scale(1)',
      // style: theme({ origin: 'center' }),
    },
    [
      h(Path, {
        fill: 'currentColor',
        stroke: input.stroke ?? '#000',
        'stroke-linecap': 'round',
        'stroke-width': '1.5',
        d: 'M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z',
      }),
    ],
  )
}

export const PlayerIcon = ({ style, color }: { style?: Record<string, unknown>; color: 'w' | 'b' }) => {
  return h(
    Svg,
    {
      viewBox: '0 0 45 45',
      style,
    },
    [
      h(
        G,
        {
          transform: 'translate(0 -2) scale(1.25)',
          // style: theme({ origin: 'center' }),
        },
        [
          h(Path, {
            fill: color === 'w' ? '#fff' : '#000',
            stroke: color === 'w' ? '#000' : '#fff',
            'stroke-linecap': 'round',
            'stroke-width': '1.2',
            d: 'M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z',
          }),
        ],
      ),
    ],
  )
}
