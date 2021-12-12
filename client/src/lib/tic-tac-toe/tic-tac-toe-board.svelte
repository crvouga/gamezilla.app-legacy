<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ITicTacToeBoardTheme } from './tic-tac-toe-board-theme';
	import { defaultTheme } from './tic-tac-toe-board-theme';
	import { toBoardLines, toBoardPositions } from './tic-tac-toe-board-utility';

	export let rowCount: number;
	export let columnCount: number;
	export let moves: { player: 'one' | 'two'; column: number; row: number }[];
	export let theme: ITicTacToeBoardTheme = defaultTheme;

	$: lines = toBoardLines({ rowCount, columnCount });
	$: positions = toBoardPositions({ rowCount, columnCount });

	const dispatch = createEventDispatcher<{ click: { row: number; column: number } }>();
</script>

<svg width="100%" stroke-width="0.1" viewBox="0 0 {columnCount} {rowCount}">
	<g stroke={theme.lines}>
		{#each lines as { x1, y1, x2, y2 }}
			<line {x1} {y1} {x2} {y2} />
		{/each}
	</g>

	<g stroke-width="0.1">
		{#each moves as { player, column, row }}
			<g transform="translate({column}, {row})">
				{#if player === 'one'}
					<g stroke={theme.playerOne}>
						<line x1={0} y1={0} x2={1} y2={1} />
						<line x1={1} y1={0} x2={0} y2={1} />
					</g>
				{:else if player === 'two'}
					<circle stroke={theme.playerTwo} fill="transparent" cx={1 / 2} cy={1 / 2} r={1 / 2} />
				{/if}
			</g>
		{/each}
	</g>

	<g fill="transparent">
		{#each positions as { column, row }}
			<rect
				on:click={() => {
					dispatch('click', { row, column });
				}}
				x={column}
				y={row}
				width={1}
				height={1}
			/>
		{/each}
	</g>
</svg>
