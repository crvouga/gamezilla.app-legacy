<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ChevronRight from "../components/icons/ChevronRight.svelte";
  import Google from "../components/icons/Google.svelte";
  import Phone from "../components/icons/Phone.svelte";

  const dispatch = createEventDispatcher<{
    "continue-with": "phone" | "google";
  }>();
</script>

<div class="w-full p-2 flex justify-center items-center border-b">
  <h1 class="text-lg font-medium">Login</h1>
</div>

<div
  on:click={() => {
    dispatch('continue-with', 'google');
  }}
  class="w-full p-4 flex items-center border-b cursor-pointer hover:opacity-80 active:opacity-50">
  <Google class="mr-4" />
  <p class="font-medium flex-1">Continue with Google</p>
  <ChevronRight />
</div>

<div
  on:click={() => {
    dispatch('continue-with', 'phone');
  }}
  class="w-full p-4 flex items-center border-b cursor-pointer hover:opacity-80 active:opacity-50">
  <Phone class="mr-4" />
  <p class="font-medium flex-1">Continue with Phone</p>
  <ChevronRight />
</div>
