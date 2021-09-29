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
    class="padding-1 margin-bottom-1" />

  <Button
    fullWidth
    text="Cancel"
    class="margin-bottom-1"
    onClick={() => {
      navigate('/');
    }} />

  <Button
    fullWidth
    onClick={() => {
      navigate('/');
      dataAccess.auth.unauthenticate();
    }}
    text="Sign Out"
    class="margin-bottom-1" />
</Modal>
