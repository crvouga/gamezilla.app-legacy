import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";

export type FlowClientCtx = SpaceClientCtx & { onExit: () => void };
