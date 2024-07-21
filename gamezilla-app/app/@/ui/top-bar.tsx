import { TranslatedText } from "gamezilla-app/@/l18n";
import { Translator } from "gamezilla-app/@/l18n/generated";
import {
	cn,
	IconArrowLeft,
	IconButton,
	IconButtonEmpty,
	Typography,
} from "gamezilla-app/app/@/ui";

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
				"w-full px-4 h-16 flex items-center truncate shrink-0 border-b border-neutral-700",
				input.center && "text-center",
			)}
		>
			{input.onBack && (
				<IconButton
					onClick={input.onBack}
					className="-ml-2"
					label={input.ctx.t("app.exit")}
					renderIcon={(inputIcon) => <IconArrowLeft {...inputIcon} />}
				/>
			)}

			<div className="flex-1 truncate flex flex-col">
				<Typography
					role="heading"
					className="font-bold truncate px-2 text-xl"
					variant="title"
					text={input.title}
				/>

				{input.subtitle && (
					<Typography
						className="text-xs text-neutral-300 truncate px-2"
						role="heading"
						variant="subtitle"
						text={input.subtitle}
					/>
				)}
			</div>

			{input.center && input.onBack && <IconButtonEmpty />}
		</div>
	);
};
