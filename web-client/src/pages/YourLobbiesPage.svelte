<script lang="ts">
  import { Link } from "svelte-routing";
  import Container from "../generic/Container.svelte";
  import PageBar from "../generic/PageBar.svelte";
  import { lobbyStatesStore } from "../stores";
</script>

<style>
  ul {
    overflow-y: scroll;
    height: 100%;
  }
  li {
    padding: var(--spacing);
  }
</style>

<PageBar title="Your Lobbies" />

<Container>
  <ul>
    {#each $lobbyStatesStore as lobbyState}
      <Link to={`lobby/${lobbyState.lobbyId}`}>
        <li>{JSON.stringify(lobbyState)}</li>
      </Link>
    {/each}
  </ul>
</Container>
