import { AriaRole } from "react";

export const Text = (input: {
	role: AriaRole;
	value: string;
	className?: string;
}) => {
	return (
		<p role={input.role} className={input.className} aria-label={input.value}>
			{input.value}
		</p>
	);
};
