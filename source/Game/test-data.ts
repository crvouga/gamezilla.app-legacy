import { ctx } from "../test-data";
import { GameRoomCtx } from "./Game.Shared";

export const gameRoomCtx: GameRoomCtx = {
    hostId: ctx.currentUserId,
    onQuit: () => { }

}