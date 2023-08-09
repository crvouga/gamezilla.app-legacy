import { SpaceViewCtx } from "src/app/space/@";

export type FlowViewCtx = SpaceViewCtx & { onExit: () => void };
