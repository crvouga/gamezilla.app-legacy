import { AriaRole } from "react";

export const Text = (props: {
	role: AriaRole;
	value: string;
	className?: string;
}) => {
	return (
		<p role={props.role} className={props.className} aria-label={props.value}>
			{props.value}
		</p>
	);
};
