<script lang="ts">
  import ChevronRight from "./components/icons/ChevronRight.svelte";
  import Google from "./components/icons/Google.svelte";
  import LoadingModal from "./components/LoadingModal.svelte";

  let state: { type: "idle" } | { type: "loading" } = { type: "idle" };
</script>

{#if state.type === 'loading'}
  <LoadingModal />
{/if}

<div class="w-full p-2 flex justify-center items-center border-b">
  <h1 class="text-lg font-medium">Login</h1>
</div>

<div
  on:click={() => {
    state = { type: 'loading' };
  }}
  class="w-full p-4 flex items-center border-b cursor-pointer hover:opacity-80 active:opacity-50">
  <Google class="mr-4" />
  <p class="font-medium flex-1">Continue with Google</p>
  <ChevronRight />
</div>
