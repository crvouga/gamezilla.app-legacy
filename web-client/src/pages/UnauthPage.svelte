<script lang="ts">
  import { navigate } from "svelte-routing";
  import { dataAccess } from "../data-access";
  import Button from "../generic/Button.svelte";
</script>

<h1>Sign out of Gamezilla?</h1>

<Button
  slot="secondary-button"
  on:click={() => {
    navigate('/');
  }}>
  Cancel
</Button>

<Button
  slot="primary-button"
  on:click={() => {
    navigate('/');
    dataAccess.auth.unauthenticate();
  }}
  class="w-100 mb-1">
  Sign Out
</Button>
