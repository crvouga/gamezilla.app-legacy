export type Model = {
    playerOne: {
        shoots: Position[]
        ships: Ship[]
    }
    playerTwo: {
        shoots: Position[]
        ships: Ship[]
    }
}

export type Position = {
    x: number
    y: number
}

type Ship = Position[]

export const ships = {
    carrier: 5,
    battleship: 4,
    cruiser: 3,
    submarine: 3,
    destroyer: 2
}

export type ShipType =
    | 'carrier'
    | 'battleship'
    | 'cruiser'
    | 'submarine'
    | 'destroyer'

export type ShipDirection = 'horizontal' | 'vertical'

export type ShipPlacement = {
    type: ShipType
    direction: ShipDirection
    position: Position
}

// export const placeShip = (ship: Ship, model: Model): Model => {

// }