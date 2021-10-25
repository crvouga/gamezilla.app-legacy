<script lang="ts">
  import type { IToast } from "$lib/features";
  import { createEventDispatcher } from "svelte";
  import Alert from "$lib/components/Alert.svelte";
  import Clickable from "$lib/components/Clickable.svelte";
  import Icon from "$lib/components/Icon.svelte";

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
