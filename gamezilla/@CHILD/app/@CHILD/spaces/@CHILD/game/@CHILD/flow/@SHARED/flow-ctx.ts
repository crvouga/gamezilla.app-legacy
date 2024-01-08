import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";

export type FlowClientCtx = SpaceClientCtx & { onQuit: () => void };
