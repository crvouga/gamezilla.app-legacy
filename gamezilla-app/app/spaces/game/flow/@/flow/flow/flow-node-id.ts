import { p } from "gamezilla-app/@/core/parser";

const parser = p.brand(p.str, "NodeId");

export type FlowNodeId = p.Infer<typeof parser>;

const init = (nodeId: string): FlowNodeId => {
	return nodeId as FlowNodeId;
};

export const FlowNodeId = {
    init,
    ...parser,
}