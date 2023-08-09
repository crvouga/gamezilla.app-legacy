import { SpaceViewCtx } from "gamezilla/app/space/@";

export type FlowViewCtx = SpaceViewCtx & { onExit: () => void };
