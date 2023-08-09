import { SpaceViewCtx } from "src/feat/space/shared";

export type FlowViewCtx = SpaceViewCtx & { onExit: () => void };
