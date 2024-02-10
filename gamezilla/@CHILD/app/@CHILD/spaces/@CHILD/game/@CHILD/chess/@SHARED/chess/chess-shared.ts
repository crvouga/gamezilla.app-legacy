type Mode = "vs-bot" | "vs-user" | "puzzle" | "none"

export type ChessMsgGame = { t: "mode-changed"; mode: Mode }
