import type {VDom} from 'gamezilla-app/@/vdom';
import {Typography} from './typography';
import {TranslatedText} from 'gamezilla-app/@/l18n';

export const EmptyState = ({
	renderIcon,
	label,
}: {
	renderIcon: (input: {className: string}) => VDom;
	label: TranslatedText;
}) => {
	return (
		<div className="absolute inset-0 flex h-full w-full flex-1 flex-col items-center justify-center gap-2 px-5 text-center opacity-60">
			<div className="flex flex-col items-center justify-center gap-3">
				<Typography
					variant="title"
					text={
						label
					}
				/>

				<div className="flex aspect-square flex-col items-center justify-center rounded-full bg-neutral-800 p-7">
					{renderIcon(
						{
							className: 'h-14 w-14',
						},
					)}
				</div>
			</div>
		</div>
	);
};
