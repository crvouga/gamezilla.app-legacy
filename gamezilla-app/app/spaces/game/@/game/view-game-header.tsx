import { TranslatedText } from "gamezilla-app/@/l18n";
import { Translator } from "gamezilla-app/@/l18n/generated";
import type { VDom } from "gamezilla-app/@/vdom";
import { cn, TopBar } from "gamezilla-app/app/@/ui";

export const ViewGameHeader = ({
	title,
	renderCoverArt = renderDefaultCoverArt,
	onBack,
	ctx,
}: {
	title: TranslatedText;
	renderCoverArt?: (input: { key: string; className: string }) => VDom;
	onBack: () => void;
	ctx: {
		t: Translator;
	};
}) => {
	return (
		<div className="flex w-full flex-col items-center pb-4 gap-4">
			<TopBar ctx={ctx} onBack={onBack} title={title} center />

			{renderCoverArt({
				key: title,
				className:
					"w-28 h-28 overflow-hidden rounded-lg border border-white/20",
			})}
		</div>
	);
};

const renderDefaultCoverArt = (input: { key: string; className: string }) => {
	return (
		<div
			key={input.key}
			className={cn(
				"flex items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-neutral-800 p-4 text-neutral-300",
				input.className,
			)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 640 512"
				className="h-16 w-16"
				fill="currentColor"
				stroke="currentColor"
			>
				<path d="M192 64C86 64 0 150 0 256S86 448 192 448H448c106 0 192-86 192-192s-86-192-192-192H192zM496 168a40 40 0 1 1 0 80 40 40 0 1 1 0-80zM392 304a40 40 0 1 1 80 0 40 40 0 1 1 -80 0zM168 200c0-13.3 10.7-24 24-24s24 10.7 24 24v32h32c13.3 0 24 10.7 24 24s-10.7 24-24 24H216v32c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h32V200z" />
			</svg>
		</div>
	);
};
