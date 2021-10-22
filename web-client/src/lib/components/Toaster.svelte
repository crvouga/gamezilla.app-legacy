<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Alert from "./Alert.svelte";
  import Clickable from "./Clickable.svelte";
  import Icon from "./Icon.svelte";

  type IToast = {
    id: string;
    type: "error" | "success";
    message: string;
  };

  export let toasts: IToast[];

  const dispatch = createEventDispatcher<{ removed: { id: string } }>();

  const handleClose = (id: string) => () => {
    dispatch("removed", { id });
  };
</script>

<div class="fixed bottom-0 left-0 w-full">
  {#each toasts as toast}
    <Alert variant={toast.type} class="p-2">
      <Icon
        iconName={toast.type === 'error' ? 'exclamation-circle' : 'check-circle'}
        slot="prefix" />

      {toast.message}

      <Clickable slot="suffix" on:click={handleClose(toast.id)}>
        <Icon iconName="close" />
      </Clickable>
    </Alert>
  {/each}
</div>
