<script lang="ts">
  import { Link } from "svelte-routing";
  import PageContainer from "../generic/PageContainer.svelte";
  import { lobbyStatesStore } from "../stores";
</script>

<PageContainer>
  {#each $lobbyStatesStore as lobbyState}
    <Link to={`lobby/${lobbyState.lobbyId}`}>lobby</Link>
  {/each}
</PageContainer>
