import { GameSpaceViewCtx } from "src/libs/feat/game-space/shared";

export type FlowViewCtx = GameSpaceViewCtx & { onExit: () => void };
