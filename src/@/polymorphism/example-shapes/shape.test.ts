import { expect, test, describe } from '~/@/test-runner'
import { area, perimeter, volume } from './shape'
import { Circle } from './shape-circle'
import { Octagon } from './shape-octagon'
import { Rect } from './shape-rect'
import { Sphere } from './shape-sphere'

const shapes3D = [Sphere({ radius: 5 })]

const shapes2D = [
  Circle({ radius: 5 }),
  Circle({ radius: 10 }),
  Octagon({ side: 5 }),
  Rect({ width: 5, height: 20 }),
  Rect({ width: 10, height: 20 }),
]

describe('Shapes', () => {
  test('area', async () => {
    for (const shape of shapes2D) {
      expect(typeof area(shape)).toEqual('number')
    }
  })

  test('perimeter', async () => {
    for (const shape of shapes2D) {
      expect(typeof perimeter(shape)).toEqual('number')
    }
  })

  test('volume', async () => {
    for (const shape of shapes3D) {
      expect(typeof volume(shape)).toEqual('number')
    }
  })
})
