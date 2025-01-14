import { Shape, ShapeStream } from '@electric-sql/client'
import type { ILogger } from '~/@/logger'
import { Err } from '~/@/result'
import { ELECTRIC_URL } from '~/config/shared'
import type { IPuzzleDb } from './interface'

const puzzles = () => {
  const stream = new ShapeStream({
    url: `${ELECTRIC_URL}/v1/shape`,
    params: {
      table: 'game_flow_puzzle',
    },
  })
  const shape = new Shape(stream)

  // The callback runs every time the Shape data changes.
  shape.subscribe((data) => {
    console.log('puzzles', data)
  })
}

const packs = () => {
  const stream = new ShapeStream({
    url: `${ELECTRIC_URL}/v1/shape`,
    params: {
      table: 'game_flow_pack',
    },
  })
  const shape = new Shape(stream)

  // The callback runs every time the Shape data changes.
  shape.subscribe((data) => {
    console.log('packs', data)
  })
}
if (typeof window !== 'undefined') {
  packs()
  puzzles()
}

const migrateUp = () => {}

export const PuzzleDbElectric = (_config: { logger: ILogger }): IPuzzleDb => {
  return {
    async get(_flowPuzzleId) {
      return Err('not implemented')
    },

    async count(_input) {
      return Err('not implemented')
    },

    async query(_input) {
      return Err('not implemented')
    },

    async put(_flowPuzzle) {
      return Err('not implemented')
    },

    async zap(_input) {
      return Err('not implemented')
    },

    async subscribe(_input) {
      return Err('not implemented')
    },
  }
}
