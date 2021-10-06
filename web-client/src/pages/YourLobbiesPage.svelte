<script lang="ts">
  import { Link } from "svelte-routing";
  import PageContainer from "../generic/PageContainer.svelte";
  import PageBar from "../generic/PageBar.svelte";
  import { lobbyStatesStore } from "../stores";
  import IconButton from "../generic/IconButton.svelte";
</script>

<PageBar>
  <Link slot="left" to="/">
    <IconButton name="chevron-left" />
  </Link>
  <h1 slot="title">Your Lobbies</h1>
</PageBar>

<PageContainer>
  {#each $lobbyStatesStore as lobbyState}
    <Link to={`lobby/${lobbyState.lobbyId}`}>lobby</Link>
  {/each}
</PageContainer>
