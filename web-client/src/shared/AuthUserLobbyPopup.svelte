<script lang="ts">
  import { setContext } from "svelte";
  import { navigate } from "svelte-routing";
  import {
    authUserKey,
    IAuthUser,
  } from "../data-access/auth-data-access.interface";
  import { lobbyStatesStore } from "../stores";
  import Button from "../generic/Button.svelte";
  import Typography from "../generic/Typography.svelte";

  export let authUser: IAuthUser;

  setContext(authUserKey, authUser);
</script>

<style>
  .lobby-state-popup {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100vw;
    background: var(--surface-color);
    padding: var(--spacing);
  }
</style>

{#if $lobbyStatesStore.length > 0}
  <div class="lobby-state-popup">
    <Typography
      variant="small-title"
      text="You're in a lobby right now"
      class="margin-bottom-1" />
    <Button
      fullWidth
      text="Go To Lobby"
      onClick={() => {
        navigate('/auth-user/lobby');
      }} />
  </div>
{/if}
