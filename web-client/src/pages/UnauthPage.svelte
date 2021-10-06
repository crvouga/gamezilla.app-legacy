<script lang="ts">
  import { navigate } from "svelte-routing";
  import { dataAccess } from "../data-access";
  import Button from "../generic/Button.svelte";
  import Modal from "../generic/Modal.svelte";
</script>

<Modal state="opened">
  <h1 slot="title">Sign out of Gamezilla?</h1>

  <Button
    slot="secondary-button"
    class="w-100 mb-1"
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
</Modal>
