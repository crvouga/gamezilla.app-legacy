<script lang="ts">
  import { draw } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  export let start: [number, number];
  export let end: [number, number];
  export let delay = 200;
</script>

<line
  in:draw|local={{ duration: 1000, delay: delay, easing: quintOut }}
  fill="none"
  stroke="cornflowerblue"
  stroke-width="0.1px"
  stroke-linejoin="round"
  x1={start[0]}
  y1={start[1]}
  x2={end[0]}
  y2={end[1]} />
