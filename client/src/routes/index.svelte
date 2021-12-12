<script lang="ts">
	import { eventsStore } from '$lib';
	import TicTacToeBoard from '$lib/tic-tac-toe/tic-tac-toe-board.svelte';

	let moves: { player: 'one' | 'two'; row: number; column: number }[] = [];
</script>

<TicTacToeBoard
	rowCount={3}
	columnCount={3}
	{moves}
	on:click={(e) => {
		moves = [
			...moves,
			{
				player: moves.length % 2 === 0 ? 'one' : 'two',
				...e.detail
			}
		];
	}}
/>

<div>
	{#each $eventsStore as event}
		<div>
			{JSON.stringify(event)}
		</div>
	{/each}
</div>
