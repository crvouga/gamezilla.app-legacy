type Mode = "vs-bot" | "vs-user" | "puzzle" | "none";

export type ChessGameMsg = { t: "mode-changed"; mode: Mode };
