<script lang="ts">
	
	

  import {dispatch,eventsStore, turnStore, move, boardStore } from '$lib';
  import type { IPlayer } from '$lib';
	import Tabs from '$lib/Tabs.svelte';

  $: turn = $turnStore

  const handleClick = (row: number, column: number) => () => { 
    dispatch(move({player: turn, row, column}))
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
  .board {
    margin-bottom: 3rem;
  }
</style>

<div class=".board">
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

<div>
  {#each $eventsStore as event, index }
    
  <div>
    {JSON.stringify(event)}
  </div>        
    
  {/each}
</div>
