import { definePolymorphicFunction } from "gamezilla/@SHARED/polymorphism/polymorphic-function"

export type Ship = {
  Ship: string
  size: number
}

export const placeShip =
  definePolymorphicFunction<(ship: Ship, model: {}) => {}>()

export const removeShip =
  definePolymorphicFunction<(ship: Ship, model: {}) => {}>()
