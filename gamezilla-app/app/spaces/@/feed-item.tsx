const Info = (input: { text: string }) => {
	return (
		<div className="flex w-full items-center justify-center text-xs text-neutral-300">
			{input.text}
		</div>
	);
};

export const FeedItem = {
	Info,
};
