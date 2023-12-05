import { SpaceViewCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";

export type FlowViewCtx = SpaceViewCtx & { onExit: () => void };
