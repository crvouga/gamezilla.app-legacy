import { SpaceViewCtx } from "gamezilla/app/@CHILD/space/@SHARED";

export type FlowViewCtx = SpaceViewCtx & { onExit: () => void };
