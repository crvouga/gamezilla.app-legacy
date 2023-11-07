import { SpaceViewCtx } from "gamezilla/app/space/@SHARED";

export type FlowViewCtx = SpaceViewCtx & { onExit: () => void };
