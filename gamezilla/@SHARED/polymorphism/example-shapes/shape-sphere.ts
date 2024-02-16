import { Shape3D, volume } from "./shape"

export type Sphere = {
  Shape: "sphere"
  Shape3D: "sphere"
  radius: number
}

const isSphere = (shape: Shape3D): shape is Sphere => shape.Shape3D === "sphere"

volume.implement(isSphere, (shape) => 4 * Math.PI * shape.radius ** 2)

export const Sphere = (input: { radius: number }): Sphere => ({
  ...input,
  Shape3D: "sphere",
  Shape: "sphere",
})
