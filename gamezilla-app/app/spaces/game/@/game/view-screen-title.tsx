import { Translator } from "gamezilla-app/@/l18n/generated";
import { cn, IconArrowLeft } from "gamezilla-app/app/@/ui";

export const ViewScreenTitle = (input: {
	title: string;
	subtitle?: string;
	center?: boolean;
	ctx: {
		t: Translator;
	};
	onBack: () => void;
}) => {
	return (
		<div
			className={cn(
				"w-full p-4 flex items-center truncate shrink-0",
				input.center && "text-center",
			)}
		>
			<button
				onClick={input.onBack}
				className="p-2 rounded-full -ml-2"
				aria-label={input.ctx.t("app.exit")}
			>
				<IconArrowLeft className="h-7 w-7" />
			</button>
			<div className="flex-1 truncate">
				{input.subtitle && (
					<p className="text-neutral-200 text-xs tracking-widest font-light">
						{input.subtitle}
					</p>
				)}
				<p role="heading" className="text-3xl font-bold truncate px-2">
					{input.title}
				</p>
			</div>
			{input.center && (
				<div onClick={() => {}} className="p-2 rounded-full -mr-2">
					<div className="h-7 w-7" />
				</div>
			)}
		</div>
	);
};
