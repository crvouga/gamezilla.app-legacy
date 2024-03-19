import { VDomChildren } from "gamezilla-app/@SHARED/vdom";
export type PrivateDrawerProps = {
    id: string;
    onClose: () => void;
    open: boolean;
    position: "bottom" | "top";
};
export type DrawerProps = PrivateDrawerProps & {
    children?: VDomChildren;
};
