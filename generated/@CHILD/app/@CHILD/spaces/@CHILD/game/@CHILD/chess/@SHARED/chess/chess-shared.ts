type Mode = "vs-bot" | "vs-user" | "puzzle" | "none";
export type ChessMsgSync = {
    t: "mode-changed";
    mode: Mode;
};
