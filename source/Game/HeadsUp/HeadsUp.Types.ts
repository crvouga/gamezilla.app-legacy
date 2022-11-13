import { Set } from "../../Core"
import { NonNegInt, UserId } from "../../Data"

export type Model = {
    turn: UserId
    guess: string,
    countDown: NonNegInt,
    players: Set<UserId>
}