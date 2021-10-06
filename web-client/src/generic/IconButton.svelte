<script lang="ts">
  import Icon, { IconName } from "./Icon.svelte";
  export let name: IconName;
</script>

<button class="p-2 rounded-full focus:ring-1" {...$$restProps}>
  <Icon {name} />
</button>
