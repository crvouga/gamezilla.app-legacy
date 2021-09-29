<script lang="ts">
  import { getContext } from "svelte";
  import { navigate } from "svelte-routing";
  import Button from "../generic/Button.svelte";
  import Modal from "../generic/Modal.svelte";
  import Typography from "../generic/Typography.svelte";

  const { authDataAccess } = getContext("auth");
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
      authDataAccess.unauthenticate();
    }}
    text="Sign Out"
    class="margin-bottom-1" />
</Modal>
