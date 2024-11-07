import { Polymorphic } from '../polymorphic-function'

export type Shape = {
  Shape: string
}

export type Shape2D = Shape & {
  Shape2D: string
}

export type Shape3D = Shape & {
  Shape3D: string
}

export const area = Polymorphic<(shape: Shape2D) => number>()

export const perimeter = Polymorphic<(shape: Shape2D) => number>()

export const volume = Polymorphic<(shape: Shape3D) => number>()

export const surfaceArea = Polymorphic<(shape: Shape3D) => number>()

export const scale = Polymorphic<(shape: Shape, scaleBy: number) => Shape>()
