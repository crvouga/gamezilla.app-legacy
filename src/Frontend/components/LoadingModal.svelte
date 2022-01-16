<script lang="ts">
  import Backdrop from "./Backdrop.svelte";
  import Spinner from "./Spinner.svelte";
  import Surface from "./Surface.svelte";
</script>

<Backdrop>
  <Surface class="mx-8">
    <Spinner />
  </Surface>
</Backdrop>
