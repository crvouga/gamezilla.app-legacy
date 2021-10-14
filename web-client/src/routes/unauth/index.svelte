<script lang="ts">
  import { dataAccess } from "$lib/data-access";
  import Button from "$lib/components/Button.svelte";
</script>

<h1>Sign out of Gamezilla?</h1>

<a href="/auth">
  <Button
    slot="primary-button"
    on:click={() => {
      dataAccess.auth.unauthenticate();
    }}
    class="w-100 mb-1">
    Sign Out
  </Button>
</a>
