import { Position } from "./Position"

export type Direction = "North" | "South" | "East" | "West"

const toVector = (direction: Direction): Position => {
    switch (direction) {
        case 'East': {
            return { x: 1, y: 0, }
        }
        case 'West': {
            return { x: -1, y: 0, }
        }
        case 'North': {
            return { x: 0, y: -1, }
        }
        case 'South': {
            return { x: 0, y: 1, }
        }
    }
}

export const Direction = {
    toVector
}