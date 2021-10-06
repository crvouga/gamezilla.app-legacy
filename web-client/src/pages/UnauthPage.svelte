<script lang="ts">
  import { navigate } from "svelte-routing";
  import { dataAccess } from "../data-access";
  import Button from "../generic/Button.svelte";
  import Modal from "../generic/Modal.svelte";
  import Typography from "../generic/Typography.svelte";
</script>

<Modal state="opened">
  <Typography
    text="Sign out of Gamezilla?"
    variant="medium-title"
    class="p-1 mb-1" />

  <Button
    slot="secondary-button"
    class="w-100 mb-1"
    onClick={() => {
      navigate('/');
    }}>
    Cancel
  </Button>

  <Button
    slot="primary-button"
    onClick={() => {
      navigate('/');
      dataAccess.auth.unauthenticate();
    }}
    class="w-100 mb-1">
    Sign Out
  </Button>
</Modal>
