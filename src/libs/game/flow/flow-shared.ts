import { GameSpaceViewCtx } from "@gamezilla/shared/game-space";

export type FlowViewCtx = GameSpaceViewCtx & { onExit: () => void };
