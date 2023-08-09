import { SpaceViewCtx } from "src/app/space/@shared";

export type FlowViewCtx = SpaceViewCtx & { onExit: () => void };
