import type {TranslatedText} from 'gamezilla-app/@/l18n';
import type {Translator} from 'gamezilla-app/@/l18n/generated';
import {
	cn,
	IconArrowLeft,
	IconButton,
	IconButtonEmpty,
	Typography,
} from 'gamezilla-app/app/@/ui';

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
				'flex h-16 w-full shrink-0 items-center truncate border-b border-neutral-700 px-4',
				input.center &&
					'text-center',
			)}
		>
			{input.onBack && (
				<IconButton
					onClick={
						input.onBack
					}
					className="-ml-2"
					label={input.ctx.t(
						'app.exit',
					)}
					renderIcon={(
						inputIcon,
					) => (
						<IconArrowLeft
							{...inputIcon}
						/>
					)}
				/>
			)}

			<div className="flex flex-1 flex-col truncate">
				<Typography
					role="heading"
					className="truncate px-2 text-xl font-bold"
					variant="title"
					text={
						input.title
					}
				/>

				{input.subtitle && (
					<Typography
						className="truncate px-2 text-xs text-neutral-300"
						role="heading"
						variant="subtitle"
						text={
							input.subtitle
						}
					/>
				)}
			</div>

			{input.center &&
				input.onBack && (
					<IconButtonEmpty />
				)}
		</div>
	);
};
