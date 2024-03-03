import { Polymorphic } from "gamezilla-app/@SHARED/polymorphism/polymorphic-function"
import { Pos2d } from "../pos-2d/pos-2d"

export type Ship = {
  Ship: string
  size: number
  origin: Pos2d
}

export const placeShip = Polymorphic<(ship: Ship, model: {}) => {}>()

export const removeShip = Polymorphic<(ship: Ship, model: {}) => {}>()
