<script lang="ts">
  import { Link } from "svelte-routing";
  import PageContainer from "../generic/PageContainer.svelte";
  import PageBar from "../generic/PageBar.svelte";
  import { lobbyStatesStore } from "../stores";
</script>

<PageBar>
  <h1 slot="title">Your Lobbies</h1>
</PageBar>

<PageContainer>
  {#each $lobbyStatesStore as lobbyState}
    <Link to={`lobby/${lobbyState.lobbyId}`}>lobby</Link>
  {/each}
</PageContainer>
