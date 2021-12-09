<script lang="ts">
	

  import {dispatch,eventsStore, move, boardStore } from '$lib';
  import type { IPlayer } from '$lib';
	import Tabs from '$lib/Tabs.svelte';

  

  const handleClick = (row: number, column: number) => () => { 
    dispatch(move({player: 'one', row, column}))
  }

</script>


<style>
  .column {
    display: flex;
    width: 100%
  }
  .cell {
    flex: 1;
    height: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<div class="flex">
  {#each $boardStore as column, columnIndex }
    <div class="column">
      {#each column as cell, rowIndex}
        <div class='cell' on:click={handleClick(rowIndex, columnIndex)}>
          {JSON.stringify(cell)}
        </div>
      {/each}
    </div>
  {/each}
</div>
