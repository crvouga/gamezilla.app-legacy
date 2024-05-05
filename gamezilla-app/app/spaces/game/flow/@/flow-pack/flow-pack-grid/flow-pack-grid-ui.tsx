import type { VDom } from "gamezilla-app/@/vdom";
import { IconPlus, Swiper } from "gamezilla-app/app/@/ui";
import { FlowPuzzleId } from "../../flow-puzzle/flow-puzzle-id";

const COLUMN_COUNT = 5;
const ROW_COUNT = 6;
const PER_SLIDE_ITEM_COUNT = COLUMN_COUNT * ROW_COUNT;

const toIndex = ({ x, y }: { x: number; y: number }) => {
	return y * COLUMN_COUNT + x;
};

const toSlideIndex = (input: { index: number }) => {
	return Math.floor(input.index / (COLUMN_COUNT * ROW_COUNT));
};

const ViewPackPuzzleGridSlide = (props: {
	slideIndex: number;
	puzzleIds: FlowPuzzleId[];
	renderCell: (input: {
		x: number;
		y: number;
		index: number;
		puzzleId: FlowPuzzleId | null;
		empty: boolean;
	}) => VDom;
}) => {
	const columns: VDom[] = [];
	const indexOffset = props.slideIndex * (COLUMN_COUNT * ROW_COUNT);

	for (let y = 0; y < ROW_COUNT; y++) {
		const row: VDom[] = [];
		for (let x = 0; x < COLUMN_COUNT; x++) {
			const index = toIndex({ x, y }) + indexOffset;
			const puzzleId = props.puzzleIds[index] ?? null;
			const empty = index >= props.puzzleIds.length;

			row.push(
				<div
					key={`${y}-${x}`}
					className="flex aspect-square h-12 w-12 items-center justify-center overflow-hidden p-1 sm:h-16 sm:w-16"
				>
					{props.renderCell({ x, y, puzzleId, empty, index })}
				</div>,
			);
		}

		columns.push(
			<div key={y} className="flex w-full items-center justify-center">
				{row}
			</div>,
		);
	}

	return <div className="w-full aspect-square">{columns}</div>;
};

const ViewPackPuzzleGrid = (props: {
	slideIndex: number;
	puzzleIds: FlowPuzzleId[];
	renderCell: (input: {
		x: number;
		y: number;
		empty: boolean;
		puzzleId: FlowPuzzleId | null;
		index: number;
	}) => VDom;
}) => {
	const slides: VDom[] = [];

	const slideCount = Math.ceil(
		(props.puzzleIds.length + 1) / (COLUMN_COUNT * ROW_COUNT),
	);

	for (let slideIndex = 0; slideIndex < slideCount; slideIndex++) {
		slides.push(
			<Swiper.Slide key={slideIndex} className="w-3/4">
				<ViewPackPuzzleGridSlide
					key={slideIndex}
					slideIndex={slideIndex}
					puzzleIds={props.puzzleIds}
					renderCell={props.renderCell}
				/>
			</Swiper.Slide>,
		);
	}

	return (
		<Swiper.Container id="123" slideIndex={props.slideIndex} className="w-full">
			{slides}
		</Swiper.Container>
	);
};

const ViewAddCell = (props: { onClick: () => void }) => {
	return (
		<button
			onClick={props.onClick}
			className="flex h-full w-full items-center justify-center overflow-hidden rounded border-2 border-neutral-700 bg-neutral-800 hover:opacity-90 active:opacity-80"
		>
			<IconPlus className="h-8 w-8" />
		</button>
	);
};

const ViewPuzzleCell = ({
	onClick,
	index,
}: {
	onClick: () => void;
	index: number;
}) => {
	return (
		<button
			onClick={onClick}
			className="flex h-full w-full items-center justify-center overflow-hidden rounded  bg-neutral-800 text-xl font-bold hover:opacity-90 active:opacity-80"
		>
			{index + 1}
		</button>
	);
};

const ViewEmptyCell = () => {
	return (
		<div className="flex h-full w-full items-center justify-center overflow-hidden rounded border-2 border-neutral-700 bg-neutral-950 opacity-70"></div>
	);
};

const ViewLoadingCell = () => {
	return (
		<div className="flex h-full w-full animate-pulse items-center justify-center overflow-hidden rounded bg-neutral-800 opacity-70"></div>
	);
};

export const FlowPackGridUI = {
	PER_SLIDE_ITEM_COUNT,
	ROW_COUNT,
	COLUMN_COUNT,
	toIndex,
	toSlideIndex,
	ViewPackPuzzleGrid,
	ViewAddCell,
	ViewPuzzleCell,
	ViewEmptyCell,
	ViewLoadingCell,
};
