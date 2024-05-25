import { cn } from "gamezilla-app/app/@/ui";

export const ViewScreenTitle = (input: {
	title: string;
	subtitle?: string;
	center?: boolean;
}) => {
	return (
		<div className={cn("w-full p-4", input.center && "text-center")}>
			{input.subtitle && (
				<p className="text-neutral-200 text-xs tracking-widest font-light">
					{input.subtitle}
				</p>
			)}
			<p role="heading" className="text-3xl font-bold">
				{input.title}
			</p>
		</div>
	);
};
