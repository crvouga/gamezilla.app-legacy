import { Portal } from "../../portal";
import { cn } from "../../ui";
import type { DrawerProps } from "../drawer-shared";
import "./drawer-element";
import { drawerSub } from "./drawer-shared";

export const DrawerWebComponent = (props: DrawerProps) => {
	drawerSub.publish({ type: "props", ...props });
	return (
		<Portal.Entrance portalId="modals">
			<drawer-element id={props.id} position={props.position}>
				<div
					className={cn(
						"h-fit max-h-full w-full overflow-hidden border border-neutral-700 bg-black",
						props.position === "bottom" ? "rounded-t-2xl" : "rounded-b-2xl",
					)}
				>
					{props.children}
				</div>
			</drawer-element>
		</Portal.Entrance>
	);
};
