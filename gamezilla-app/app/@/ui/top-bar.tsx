import { TranslatedText } from "gamezilla-app/@/l18n";
import { Translator } from "gamezilla-app/@/l18n/generated";
import { cn, IconArrowLeft } from "gamezilla-app/app/@/ui";

export const TopBar = (input: {
	title: TranslatedText;
	subtitle?: TranslatedText;
	center?: boolean;
	ctx: {
		t: Translator;
	};
	onBack: (() => void) | false;
}) => {
	return (
		<div
			className={cn(
				"w-full px-4 h-14 flex items-center truncate shrink-0",
				input.center && "text-center",
			)}
		>
			{input.onBack && (
				<button
					onClick={input.onBack}
					className="p-2 rounded-full -ml-2"
					aria-label={input.ctx.t("app.exit")}
				>
					<IconArrowLeft className="h-7 w-7" />
				</button>
			)}

			<div className="flex-1 truncate flex flex-col">
				<p role="heading" className="text-2xl font-bold truncate px-2">
					{input.title}
				</p>
				{input.subtitle && (
					<p className="text-xs text-neutral-300 truncate px-2" role="heading">
						{input.subtitle}
					</p>
				)}
			</div>

			{input.center && input.onBack && (
				<div className="p-2 rounded-full -mr-2">
					<div className="h-7 w-7" />
				</div>
			)}
		</div>
	);
};
