import { adjectives, nouns } from "gamezilla-app/@CHILD/app/@SHARED/data/words";
import { Brand } from "gamezilla-app/@SHARED/core/brand";
export type FlowPackName = Brand<string, "FlowPackName">;
const generate = ({ count }: {
    count: number;
}) => {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `Pack ${count} - ${adjective} ${noun}` as FlowPackName;
};
export const FlowPackName = {
    generate,
};
