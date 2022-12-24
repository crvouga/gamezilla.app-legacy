import { ctx } from "../test-data";
import { GameRoomCtx } from "./Game";

export const gameRoomCtx: GameRoomCtx = {
    hostId: ctx.currentUserId,
    onQuit: () => { }

}