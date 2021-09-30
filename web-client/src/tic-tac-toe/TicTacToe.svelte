<script lang="ts">
  export let columnCount: number;
  export let rowCount: number;
  import { draw } from "svelte/transition";
  import { quintOut } from "svelte/easing";
</script>

<svg width="300px" viewBox="0 0 3 3" xmlns="http://www.w3.org/2000/svg">
  <line
    fill="none"
    stroke="cornflowerblue"
    stroke-width="0.1px"
    stroke-linejoin="round"
    transition:draw={{ duration: 1000, delay: 500, easing: quintOut }}
    x1={1}
    y1={0}
    x2={1}
    y2={3} />
  <line
    fill="none"
    stroke="cornflowerblue"
    stroke-width="0.1px"
    stroke-linejoin="round"
    transition:draw={{ duration: 1000, delay: 750, easing: quintOut }}
    x1={2}
    y1={0}
    x2={2}
    y2={3} />
  <line
    fill="none"
    stroke="cornflowerblue"
    stroke-width="0.1px"
    stroke-linejoin="round"
    transition:draw={{ duration: 1000, delay: 500, easing: quintOut }}
    x1={1}
    y1={0}
    x2={1}
    y2={3} />
  <line
    fill="none"
    stroke="cornflowerblue"
    stroke-width="0.1px"
    stroke-linejoin="round"
    transition:draw={{ duration: 1000, delay: 1000, easing: quintOut }}
    x1={0}
    y1={1}
    x2={3}
    y2={1} />

  <line
    fill="none"
    stroke="cornflowerblue"
    stroke-width="0.1px"
    stroke-linejoin="round"
    transition:draw={{ duration: 1000, delay: 1250, easing: quintOut }}
    x1={0}
    y1={2}
    x2={3}
    y2={2} />
</svg>
