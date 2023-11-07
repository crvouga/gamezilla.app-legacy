import { SpaceViewCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";

export type FlowViewCtx = SpaceViewCtx & { onExit: () => void };
