import { UserId } from "../../Data"

export type Model = {
    type: "setup",
    white: UserId | "None"
    black: UserId | "None"

}