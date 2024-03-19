import { PubSub } from "gamezilla-app/@SHARED/core";
export type TransitionProps = {
    id: string;
    onEnter: (node: HTMLElement) => Promise<void>;
    onExit: (node: HTMLElement) => Promise<void>;
    className?: string;
    mode: "in-out" | "out-in";
    appear?: boolean;
};
export type TransitionEvent = TransitionProps & {
    type: "props";
};
export const transitionSub = PubSub.create<TransitionEvent>();
