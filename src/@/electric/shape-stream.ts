import { Shape, ShapeStream } from '@electric-sql/client/*'
import { ELECTRIC_URL } from '~/config/shared'
import { PubSub, Sub } from '../sub'

const stream = new ShapeStream({
  url: `${ELECTRIC_URL}/v1/shape`,
  params: {
    table: 'game_flow_puzzle',
  },
})

const _shape = new Shape(stream)

_shape.subscribe((data) => {
  console.log('new data', data)
})

export const shape = <T>(config: { electricUrl: string; table: string }): (() => Sub<T[]>) => {
  const sub = PubSub.create<T[]>()

  const stream = new ShapeStream({
    url: config.electricUrl,
    params: {
      table: config.table,
    },
  })

  const s = new Shape(stream)

  s.subscribe((data) => {
    sub.pub(data.rows as T[])
  })

  return () => {
    return sub
  }
}
