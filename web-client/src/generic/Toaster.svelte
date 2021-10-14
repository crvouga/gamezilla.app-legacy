<script lang="ts" context="module">
  import { writable } from "svelte/store";

  type IToastType = "error";

  type IToast = {
    type: IToastType;
    id: string | number;
    message: string;
    onClose: () => void;
  };

  export const ToastStore = () => {
    const toastStore = writable<IToast[]>([]);

    return {
      ...toastStore,

      remove(id: string | number) {
        toastStore.update((toasts) => {
          return toasts.filter((toast) => toast.id !== id);
        });
      },

      push(newToasts: IToast[]) {
        toastStore.update((toasts) => {
          return [...toasts, ...newToasts];
        });
      },
    };
  };

  export type IToastStore = ReturnType<typeof ToastStore>;

  export const errorToToast = (
    toastStore: IToastStore,
    error: Error
  ): IToast => {
    const id = Date.now();
    return {
      id,
      type: "error",
      message: error.message,
      onClose: () => {
        toastStore.remove(id);
      },
    };
  };
</script>

<script lang="ts">
  import Alert from "./Alert.svelte";
  import Icon from "./Icon.svelte";

  export let toasts: IToast[];
</script>

<div class="fixed bottom-0 left-0 w-full">
  {#each toasts as toast}
    <Alert class="p-2">
      <Icon iconName="exclamation-circle" slot="prefix" />
      {toast.message}
      <Icon iconName="close" slot="suffix" on:click={toast.onClose} />
    </Alert>
  {/each}
</div>
