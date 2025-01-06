import { type Ship, placeShip } from './ship'

export type ShipSubmarine = Ship & {
  Ship: 'Submarine'
  size: 3
  airLevel: number
}

const is = (ship: Ship): ship is ShipSubmarine => {
  return ship.Ship === 'Submarine'
}

placeShip.impl(is, (_submarine, model) => {
  return model
})

export const ShipSubmarine = {
  is,
}
