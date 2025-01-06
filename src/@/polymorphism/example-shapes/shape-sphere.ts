import { type Shape3D, surfaceArea, volume } from './shape'

export type Sphere = {
  Shape: 'sphere'
  Shape3D: 'sphere'
  radius: number
}

const isSphere = (shape: Shape3D): shape is Sphere => shape.Shape3D === 'sphere'

volume.impl(isSphere, (shape) => 4 * Math.PI * shape.radius ** 2)

surfaceArea.impl(isSphere, (shape) => (4 / 3) * Math.PI * shape.radius ** 3)

export const Sphere = (input: { radius: number }): Sphere => ({
  ...input,
  Shape3D: 'sphere',
  Shape: 'sphere',
})
