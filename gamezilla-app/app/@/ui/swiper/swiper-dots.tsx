export const SwiperDots = (input: {
	activeIndex: number;
	slideCount: number;
}) => {
	return (
		<div>
			{range(input.slideCount).map((index) => (
				<div
					key={index}
					className={`w-2 h-2 rounded-full mx-1 bg-gray-300 ${
						input.activeIndex === index ? "bg-gray-500" : ""
					}`}
				/>
			))}
		</div>
	);
};

const range = (end: number) => {
	const arr = [];
	for (let i = 0; i < end; i++) {
		arr.push(i);
	}
	return arr;
};
