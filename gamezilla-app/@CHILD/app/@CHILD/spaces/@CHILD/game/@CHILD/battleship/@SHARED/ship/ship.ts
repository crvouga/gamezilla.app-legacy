import { Polymorphic } from "gamezilla-app/@SHARED/polymorphism/polymorphic-function"

export type Ship = {
  Ship: string
  size: number
}

export const placeShip = Polymorphic<(ship: Ship, model: {}) => {}>()

export const removeShip = Polymorphic<(ship: Ship, model: {}) => {}>()
