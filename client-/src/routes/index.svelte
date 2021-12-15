<script lang="ts">
	import { eventsStore } from '$lib';
	import { dispatch, store } from '$lib/store';
	import { ticTacToe } from '$lib/tic-tac-toe/tic-tac-toe';
	import TicTacToeBoard from '$lib/tic-tac-toe/tic-tac-toe-board.svelte';

	$: moves = ticTacToe.selectors.moves($store);
</script>

<TicTacToeBoard
	rowCount={3}
	columnCount={3}
	{moves}
	on:click={(event) => {
		dispatch(ticTacToe.actions.boardClicked(event.detail));
	}}
/>

{JSON.stringify($store)}

<div>
	{#each $eventsStore as event}
		<div>
			{JSON.stringify(event)}
		</div>
	{/each}
</div>
