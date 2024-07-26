import {
	COLUMN_COUNT,
	type ColumnIndex,
	MAX_COLUMN_HEIGHT,
	isColumnIndex,
} from '../../../connect-four';

export const initColumns = ({
	parentNode,
	onClick,
}: {
	onClick: (columnIndex: ColumnIndex) => void;
	parentNode: SVGGElement;
}) => {
	const cleanUps: (() => void)[] = [];
	for (
		let columnIndex = 0;
		columnIndex < COLUMN_COUNT;
		columnIndex++
	) {
		const column = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'rect',
		);

		column.setAttribute('x', `${columnIndex}`);
		column.setAttribute('y', '0');
		column.setAttribute('width', '1');
		column.setAttribute(
			'height',
			`${MAX_COLUMN_HEIGHT}`,
		);
		column.setAttribute('fill', 'transparent');
		column.setAttribute('stroke', 'none');
		const listener = () => {
			if (
				isColumnIndex(
					columnIndex,
				)
			) {
				onClick(
					columnIndex,
				);
			}
		};
		column.addEventListener('click', listener);
		cleanUps.push(() => {
			column.removeEventListener(
				'click',
				listener,
			);
		});
		parentNode.appendChild(column);
	}
	return {
		cleanUps,
	};
};
