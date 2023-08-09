import { SpaceViewCtx } from "src/libs/feat/space/shared";

export type FlowViewCtx = SpaceViewCtx & { onExit: () => void };
