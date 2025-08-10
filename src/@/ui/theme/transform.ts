import { Percentage } from './percentage'

export type Transform = {
  translateX?: number | Percentage
  translateY?: number
  rotate?: number
  scale?: number
  skewX?: number
  skewY?: number
}

const toString = (transforms: Transform[]): string => {
  let output = ''
  for (const transform of transforms) {
    if (transform.translateX) {
      output += `translateX(${transform.translateX}) `
    }
    if (transform.translateY) {
      output += `translateY(${transform.translateY}) `
    }
    if (transform.rotate) {
      output += `rotate(${transform.rotate}) `
    }
    if (transform.scale) {
      output += `scale(${transform.scale}) `
    }
  }
  return output
}

export const Transform = {
  toString,
}
