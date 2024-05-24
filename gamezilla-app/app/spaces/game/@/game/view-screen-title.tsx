import { cn } from "gamezilla-app/app/@/ui";

export const ViewScreenTitle = (input: { title: string; center?: boolean }) => {
	return (
		<div className={cn("w-full p-4", input.center && "text-center")}>
			<p role="heading" className="text-3xl font-bold">
				{input.title}
			</p>
		</div>
	);
};
