import { describe, it } from "bun:test"
import * as Battleship from "./battleship-play"

const ALL_PLAYER_TYPES = ["player1", "player2"] as const

describe(import.meta.file, () => {
  it("should place a ship on the board", async () => {
    const initial = Battleship.init(ALL_PLAYER_TYPES)
    const submarine = Battleship.submarine()
    const placed = Battleship.placeShip(initial, "", submarine)
    Battleship.listShips(placed, "player1")
  })
})
